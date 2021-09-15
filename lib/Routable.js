"use strict";

require("source-map-support/register");

const path = require('path');

const {
  fs,
  glob
} = require('@genx/sys');

const {
  _,
  url: urlUtil,
  text
} = require('@genx/july');

const {
  ApplicationError,
  InvalidConfiguration
} = require('@genx/error');

const Literal = require('./enum/Literal');

const Koa = require('koa');

const mount = require('koa-mount');

const Routable = T => class extends T {
  constructor(name, options) {
    super(name, options);
    this.clientPath = this.toAbsolutePath(this.options.clientPath || Literal.CLIENT_SRC_PATH);
    this.publicPath = this.toAbsolutePath(this.options.publicPath || Literal.PUBLIC_PATH);
    this.router = new Koa();
    this.router.use((ctx, next) => {
      ctx.appModule = this;
      return next();
    });
    this.on('configLoaded', () => {
      let middlewareDir = path.join(this.backendPath, Literal.MIDDLEWARES_PATH);

      if (fs.existsSync(middlewareDir)) {
        this.loadMiddlewaresFrom(middlewareDir);
      }
    });
  }

  async start_() {
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
    let method = actionByPath.substr(lpos + 1);
    let controllerObj;

    try {
      controllerObj = require(path.resolve(this.backendPath, controller));
    } catch (error) {
      throw new Error(`Backend controller not found: ${controller}`);
    }

    let methodFunc = controllerObj[method];

    if (typeof methodFunc !== 'function') {
      throw new Error(`The specified action is not a function: ${actionByPath}`);
    }

    return methodFunc;
  }

  loadMiddlewaresFrom(dir) {
    let files = glob.sync(path.join(dir, '*.js'), {
      nodir: true
    });
    files.forEach(file => this.registerMiddlewareFactory(path.basename(file, '.js'), require(file)));
  }

  registerMiddlewareFactory(name, factoryMethod) {
    pre: typeof factoryMethod === 'function', 'Invalid middleware factory: ' + name;

    if (name in this.middlewareFactoryRegistry) {
      throw new ApplicationError('Middleware "' + name + '" already registered!');
    }

    this.middlewareFactoryRegistry[name] = factoryMethod;
    this.log('verbose', `Registered named middleware [${name}].`);
  }

  getMiddlewareFactory(name) {
    if (this.middlewareFactoryRegistry.hasOwnProperty(name)) {
      return this.middlewareFactoryRegistry[name];
    }

    if (this.server && this.server !== this) {
      return this.server.getMiddlewareFactory(name);
    }

    let npmMiddleware = this.tryRequire(name);

    if (npmMiddleware) {
      return npmMiddleware;
    }

    throw new ApplicationError(`Don't know where to load middleware "${name}".`);
  }

  useMiddlewares(router, middlewares) {
    let middlewareFactory, middleware;
    let middlewareFunctions = [];

    if (_.isPlainObject(middlewares)) {
      _.forOwn(middlewares, (options, name) => {
        middlewareFactory = this.getMiddlewareFactory(name);
        middleware = middlewareFactory(options, this);
        middlewareFunctions.push({
          name,
          middleware
        });
      });
    } else {
      middlewares = _.castArray(middlewares);

      _.each(middlewares, middlewareEntry => {
        let type = typeof middlewareEntry;

        if (type === 'string') {
          middlewareFactory = this.getMiddlewareFactory(middlewareEntry);
          middleware = middlewareFactory(undefined, this);
          middlewareFunctions.push({
            name: middlewareEntry,
            middleware
          });
        } else if (type === 'function') {
          middlewareFunctions.push({
            name: middlewareEntry.name || 'unamed middleware',
            middleware: middlewareEntry
          });
        } else if (Array.isArray(middlewareEntry)) {
          if (middlewareEntry.length === 0) {
            throw new InvalidConfiguration('Empty array found as middleware entry!', this, 'middlewares');
          }

          middlewareFactory = this.getMiddlewareFactory(middlewareEntry[0]);
          middleware = middlewareFactory(middlewareEntry.length > 1 ? middlewareEntry[1] : null, this);
          middlewareFunctions.push({
            name: middlewareEntry[0],
            middleware
          });
        } else {
          if (!_.isPlainObject(middlewareEntry) || !('name' in middlewareEntry)) {
            throw new InvalidConfiguration('Invalid middleware entry!', this, 'middlewares');
          }

          middlewareFactory = this.getMiddlewareFactory(middlewareEntry.name);
          middleware = middlewareFactory(middlewareEntry.options, this);
          middlewareFunctions.push({
            name: middlewareEntry.name,
            middleware
          });
        }
      });
    }

    middlewareFunctions.forEach(({
      name,
      middleware
    }) => {
      if (Array.isArray(middleware)) {
        middleware.forEach(m => this.useMiddleware(router, m, name));
      } else {
        this.useMiddleware(router, middleware, name);
      }
    });
    return this;
  }

  addRoute(router, method, route, actions) {
    let handlers = [],
        middlewareFactory;

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
          if (type === 'string' && action.lastIndexOf('.') > 0) {
            action = {
              name: 'action',
              options: action
            };
            type = 'object';
          }
        }

        if (type === 'string') {
          middlewareFactory = this.getMiddlewareFactory(action);
          let middleware = middlewareFactory(null, this);

          if (Array.isArray(middleware)) {
            middleware.forEach((middlewareItem, i) => handlers.push(this._wrapMiddlewareTracer(middlewareItem, `${action}-${i}` + (middleware.name ? '-' + middleware.name : ''))));
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
      });
    }

    router[method](route, ...handlers);
    let endpoint = router.opts.prefix ? urlUtil.join(this.route, router.opts.prefix, route) : urlUtil.join(this.route, route);
    this.log('verbose', `Route "${method}:${endpoint}" is added from module [${this.name}].`);
    return this;
  }

  addRouter(nestedRouter) {
    this.router.use(nestedRouter.routes());
    this.router.use(nestedRouter.allowedMethods());
    return this;
  }

  mountRouter(route, router) {
    this.router.use(mount(route, router));
  }

  toWebPath(relativePath, ...pathOrQuery) {
    let url, query;

    if (pathOrQuery && pathOrQuery.length > 0 && (pathOrQuery.length > 1 || pathOrQuery[0] !== undefined)) {
      if (_.isObject(pathOrQuery[pathOrQuery.length - 1])) {
        query = pathOrQuery.pop();
      }

      pathOrQuery.unshift(relativePath);
      url = urlUtil.join(this.route, ...pathOrQuery);
    } else {
      url = urlUtil.join(this.route, relativePath);
    }

    url = text.ensureStartsWith(url, '/');

    if (query) {
      url = urlUtil.appendQuery(url, query);
      url = url.replace('/?', '?');
    }

    return url;
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
      };
    }

    return middleware;
  }

  _getFeatureFallbackPath() {
    return super._getFeatureFallbackPath().concat([path.join(this.backendPath, Literal.FEATURES_PATH)]);
  }

};

module.exports = Routable;
//# sourceMappingURL=Routable.js.map