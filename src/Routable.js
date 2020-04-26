"use strict";

const path = require('path');
const { _, fs, glob, urlJoin, ensureLeftSlash, ensureRightSlash, urlAppendQuery } = require('rk-utils');
const { Helpers: { tryRequire } } = require('@genx/app');
const Errors = require('./utils/Errors');
const Literal = require('./enum/Literal');
const Koa = require('koa');

const Routable = T => class extends T {    
    /**     
     * @param {string} name - The name of the routable instance.     
     * @param {object} [options] - Routable options               
     * @property {string} [options.backendPath='server'] - Relative path of back-end server source files
     * @property {string} [options.clientPath='client'] - Relative path of front-end client source files     
     * @property {string} [options.publicPath='public'] - Relative path of front-end static files 
     */         
    constructor(name, options) {
        super(name, options);        

        /**
         * Frontend source files path.
         * @member {string}
         **/
        this.clientPath = this.toAbsolutePath(this.options.clientPath || Literal.CLIENT_SRC_PATH);

        /**
         * Frontend static files path.
         * @member {string}
         **/
        this.publicPath = this.toAbsolutePath(this.options.publicPath || Literal.PUBLIC_PATH);

        /**
         * Each app has its own router.
         * @member {Koa}
         **/
        this.router = new Koa();

        //inject the appModule instance in the first middleware
        this.router.use((ctx, next) => { 
            ctx.appModule = this; 
            return next(); 
        });

        this.on('configLoaded', () => {
            //load middlewares if exists in server or app path
            let middlewareDir = path.join(this.backendPath, Literal.MIDDLEWARES_PATH);
            
            if (fs.existsSync(middlewareDir)) {
                this.loadMiddlewaresFrom(middlewareDir);
            }            
        });  
    }

    async start_() {
        /**
         * Middleware factory registry.
         * @member {object}
         */
        this.middlewareFactoryRegistry = {};

        return super.start_();
    }

    async stop_() {
        delete this.middlewareFactoryRegistry;

        return super.stop_();
    }

    getBackendAction(actionByPath) {
        let lpos = actionByPath.lastIndexOf('.');

        if (lpos === -1) {
            throw new Error(`Invalid action path: ${actionByPath}`);
        }

        let controller = actionByPath.substr(0, lpos);
        let method = actionByPath.substr(lpos+1);
        let controllerObj;

        try {
            controllerObj = require(path.join(this.backendPath, controller));
        } catch (error) {
            throw new Error(`Backend controller not found: ${controller}`);
        }       

        let methodFunc = controllerObj[method];
        if (typeof methodFunc !== 'function') {
            throw new Error(`The specified action is not a function: ${actionByPath}`);
        }

        return methodFunc;
    }

    /**
     * Load and regsiter middleware files from a specified path.
     * @param dir
     */
    loadMiddlewaresFrom(dir) {
        let files = glob.sync(path.join(dir, '*.js'), {nodir: true});
        files.forEach(file => this.registerMiddlewareFactory(path.basename(file, '.js'), require(file)));
    }

    /**
     * Register the factory method of a named middleware.     
     * @param {string} name - The name of the middleware 
     * @param {function} factoryMethod - The factory method of a middleware
     */
    registerMiddlewareFactory(name, factoryMethod) {
        pre: typeof factoryMethod === 'function', 'Invalid middleware factory: ' + name;        

        if (name in this.middlewareFactoryRegistry) {
            throw new Errors.ServerError('Middleware "'+ name +'" already registered!');
        }

        this.middlewareFactoryRegistry[name] = factoryMethod;
        this.log('verbose', `Registered named middleware [${name}].`);
    }

    /**
     * Get the factory method of a middleware from module hierarchy.     
     * @param name
     * @returns {function}
     */
    getMiddlewareFactory(name) {
        if (this.middlewareFactoryRegistry.hasOwnProperty(name)) {
            return this.middlewareFactoryRegistry[name];
        }

        if (this.server && this.server !== this) {
            return this.server.getMiddlewareFactory(name);
        }

        let npmMiddleware = tryRequire(name);
        if (npmMiddleware) {
            return npmMiddleware;
        }

        throw new Errors.ServerError(`Don't know where to load middleware "${name}".`);
    }

    /**
     * Use middlewares
     * @param {Router} router
     * @param {*} middlewares - Can be an array of middleware entries or a key-value list of registerred middlewares
     * @returns {Routable}
     */
    useMiddlewares(router, middlewares) {
        let middlewareFactory, middleware;
        let middlewareFunctions = [];
        
        if (_.isPlainObject(middlewares)) {
            _.forOwn(middlewares, (options, name) => {
                middlewareFactory = this.getMiddlewareFactory(name);   
                middleware = middlewareFactory(options, this);
                middlewareFunctions.push({ name, middleware });                
            });
        } else {
            middlewares = _.castArray(middlewares);          
        
            _.each(middlewares, middlewareEntry => {
                let type = typeof middlewareEntry;

                if (type === 'string') {
                    // [ 'namedMiddleware' ]
                    middlewareFactory = this.getMiddlewareFactory(middlewareEntry);
                    middleware = middlewareFactory(undefined, this);
                    middlewareFunctions.push({ name: middlewareEntry , middleware });
                } else if (type === 'function') {
                    middlewareFunctions.push({ name: middlewareEntry.name || 'unamed middleware', middleware: middlewareEntry});
                } else if (Array.isArray(middlewareEntry)) {
                    // [ [ 'namedMiddleware', config ] ]
                    if (middlewareEntry.length === 0) {
                        throw new Errors.InvalidConfiguration(
                            'Empty array found as middleware entry!',
                            this,
                            'middlewares'
                        );
                    }

                    middlewareFactory = this.getMiddlewareFactory(middlewareEntry[0]);
                    middleware = middlewareFactory(middlewareEntry.length > 1 ? middlewareEntry[1] : null, this);
                    middlewareFunctions.push({ name: middlewareEntry[0], middleware });
                } else {
                    if (!_.isPlainObject(middlewareEntry) || !('name' in middlewareEntry)) {
                        throw new Errors.InvalidConfiguration(
                            'Invalid middleware entry!',
                            this,
                            'middlewares'
                        );
                    }

                    middlewareFactory = this.getMiddlewareFactory(middlewareEntry.name);
                    middleware = middlewareFactory(middlewareEntry.options, this);
                    middlewareFunctions.push({ name: middlewareEntry.name, middleware });
                }
            });
        } 
        
        middlewareFunctions.forEach(({ name, middleware }) => {            
            if (Array.isArray(middleware)) {
                middleware.forEach(m => this.useMiddleware(router, m, name));
            } else {
                this.useMiddleware(router, middleware, name);
            }            
        });        

        return this;
    }

    /**
     * Add a route to a router, skipped while the server running in deaf mode.     
     * @param router
     * @param method
     * @param route
     * @param actions
     */
    addRoute(router, method, route, actions) {
        let handlers = [], middlewareFactory;

        if (_.isPlainObject(actions)) {
            _.forOwn(actions, (options, name) => {
                middlewareFactory = this.getMiddlewareFactory(name);
                handlers.push(this._wrapMiddlewareTracer(middlewareFactory(options, this), name));
            });
        } else {
            actions = _.castArray(actions);
            let lastIndex = actions.length - 1;

            _.each(actions, (action, i) => {
                let type = typeof action;

                if (i === lastIndex) {
                    // last middleware may be an action
                    if (type === 'string' && action.lastIndexOf('.') > 0) {
                        action = {
                            name: 'action',
                            options: action
                        };

                        type = 'object';
                    }    
                }

                if (type === 'string') {
                    // [ 'namedMiddleware' ]
                    middlewareFactory = this.getMiddlewareFactory(action);   

                    let middleware = middlewareFactory(null, this);

                    //in case it's register by the middlewareFactory feature
                    if (Array.isArray(middleware)) {
                        middleware.forEach((middlewareItem, i) => handlers.push(
                            this._wrapMiddlewareTracer(middlewareItem, `${action}-${i}` + (middleware.name ? ('-' + middleware.name) : ''))
                        ));
                    } else {                    
                        handlers.push(this._wrapMiddlewareTracer(middleware, action));
                    }
                } else if (type === 'function') {
                    handlers.push(this._wrapMiddlewareTracer(action));
                } else if (Array.isArray(action)) {
                    assert: action.length > 0 && action.length <= 2, 'Invalid middleware entry';

                    middlewareFactory = this.getMiddlewareFactory(action[0]);                    
                    handlers.push(this._wrapMiddlewareTracer(middlewareFactory(action.length > 1 ? action[1] : undefined, this)));                    
                } else {
                    assert: _.isPlainObject(action) && 'name' in action, 'Invalid middleware entry';

                    middlewareFactory = this.getMiddlewareFactory(action.name);                    
                    handlers.push(this._wrapMiddlewareTracer(middlewareFactory(action.options, this), action.name));
                }
            })
        }

        router[method](route, ...handlers);

        let endpoint = router.opts.prefix ? urlJoin(this.route, router.opts.prefix, route) : urlJoin(this.route, route);

        this.log('verbose', `Route "${method}:${endpoint}" is added from module [${this.name}].`);

        return this;
    }    

    /**
     * Attach a router to this app module, skipped while the server running in deaf mode     
     * @param {Router} nestedRouter
     */
    addRouter(nestedRouter) {
        this.router.use(nestedRouter.routes());
        this.router.use(nestedRouter.allowedMethods());
        return this;
    }

    /**
     * Translate a relative path and query parameters if any to a url path     
     * @param {string} relativePath - Relative path
     * @param {...*} [pathOrQuery] - Queries
     * @returns {string}
     */
    toWebPath(relativePath, ...pathOrQuery) {
        let url, query;

        if (pathOrQuery && pathOrQuery.length > 0 && (pathOrQuery.length > 1 || pathOrQuery[0] !== undefined)) {
            if (_.isObject(pathOrQuery[pathOrQuery.length - 1])) {
                query = pathOrQuery.pop();
            }
            pathOrQuery.unshift(relativePath);
            url = urlJoin(this.route, ...pathOrQuery);
        } else {
            url = urlJoin(this.route, relativePath);
        }

        url = ensureLeftSlash(url);

        if (query) {
            url = urlAppendQuery(url, query);
            url = url.replace('/?', '?');
        }

        return url;
    }    

    /**
     * Prepare context for koa action
     * @param {Object} ctx - Koa request context
     * @param {function} action - Action function
     * @return {function}
     */
    wrapAction(action) {
        return async (ctx) => {
            ctx.toUrl = (relativePath, ...pathOrQuery) => {
                return ctx.origin + this.toWebPath(relativePath, ...pathOrQuery);
            };

            Object.assign(ctx.state, {
                _self: ctx.originalUrl || this.toWebPath(ctx.url),
                __: ctx.__,
                _base: ensureRightSlash(this.toWebPath()),
                _makePath: (relativePath, query) => this.toWebPath(relativePath, query),
                _makeUrl: (relativePath, query) => ctx.toUrl(relativePath, query)            
            });

            if (ctx.csrf) {            
                ctx.state._csrf = ctx.csrf;
            }

            return action(ctx);
        };        
    }   

    useMiddleware(router, middleware, name) {          
        assert: typeof middleware === 'function', middleware;
        router.use(this._wrapMiddlewareTracer(middleware, name));
        this.log('verbose', `Attached middleware [${name}].`);
    }

    _wrapMiddlewareTracer(middleware, name) {        
        if (this.options.traceMiddlewares) {            
            return async (ctx, next) => {                
                this.log('debug', `Step in middleware "${name || middleware.name}" ...`);                
                let ret = await middleware(ctx, next);
                this.log('debug', `Step out from middleware "${name || middleware.name}".`);                
                return ret;
            }
        }

        return middleware;
    }

    _getFeatureFallbackPath() {
        return super._getFeatureFallbackPath().concat([ path.join(this.backendPath, Literal.FEATURES_PATH) ]);
    }
};

module.exports = Routable;