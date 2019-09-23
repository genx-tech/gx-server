"use strict";

const { _, fs, eachAsync_, urlJoin, getValueByPath } = require('rk-utils');
const Router = require('koa-router');
const HttpCode = require('http-status-codes');
const { InvalidConfiguration, BadRequest, NotFound } = require('../utils/Errors');

/**
 * RESTful router.
 * @module Router_Rest
 */

 function mergeQuery(query, extra) {
    return (query && query.$query) ? { $query: { ...query.$query, ...extra } } : { ...query, ...extra };
 }

/**
 * Create a RESTful router.
 * @param {*} app 
 * @param {string} baseRoute 
 * @param {objects} options 
 * @property {string} [options.resourcesPath]
 * @property {object|array} [options.middlewares]
 * @example
 *  '<base path>': {
 *      rpc: {          
 *          middlewares: {},
 *          schemaName: '',
 *          entityModels: {}|<config path>,  
 *          apiListEndpoint: '/_list'
 *      }
 *  }
 *  
 *  route                          http method    function of ctrl
 *  /:model/:method                post           model.method 
 */
module.exports = (app, baseRoute, options) => {
    if (!options.schemaName) {
        throw new InvalidConfiguration(
            'Missing schema name config.',
            app,
            `routing.${baseRoute}.rpc.schemaName`
        );
    }    

    if (!options.entityModels) {
        throw new InvalidConfiguration(
            'Missing entity models config.',
            app,
            `routing.${baseRoute}.rpc.entityModels`
        );        
    }
    
    let router = baseRoute === '/' ? new Router() : new Router({prefix: baseRoute});

    app.useMiddleware(router, app.getMiddlewareFactory('jsonError')(), 'jsonError');

    if (options.middlewares) {
        app.useMiddlewares(router, options.middlewares);
    }

    let apiListEndpoint = options.apiListEndpoint || '/_list';

    let entityModels = options.entityModels;

    if (typeof options.entityModels === 'string') {
        entityModels = fs.readJsonSync(app.toAbsolutePath(options.entityModels)); 
    }

    app.addRoute(router, 'get', apiListEndpoint, async (ctx) => {
        let list = [];
        
        _.forOwn(entityModels, (methods, entityName) => {
            //todo: filter entity or methods by config
            let entityNameInUrl = _.kebabCase(entityName);           
            
            _.forOwn(methods, (methodInfo, methodName) => {
                let params = methodInfo.params ? Object.values(methodInfo.params).reduce((result, v) => {
                    result[v.name] = _.omit(v, ['name']);
                    return result;
                }, {}) : {};

                list.push({ method: methodInfo.httpMethod, url: urlJoin(baseRoute, entityNameInUrl, methodName), desc: methodInfo.desc, params });
            });        
        });

        ctx.body = list;
    });

    ['get', 'post'].forEach(method => {         
        app.addRoute(router, method, '/:entity/:method', async (ctx) => {
            let db = ctx.appModule.db(options.schemaName);

            let entityName = _.camelCase(ctx.params.entity);
            let methodName = _.camelCase(ctx.params.method);
            let apiInfo = entityModels[entityName];
            apiInfo = apiInfo && apiInfo[methodName];
            if (!apiInfo || apiInfo.httpMethod.toUpperCase() !== ctx.method) {
                throw new BadRequest('API endpoint not found.');
            }

            let args = [ ctx ];

            if (apiInfo.params) {
                apiInfo.params.forEach(param => {
                    let argName = param.name;
                    let value = ctx.query[argName] || ctx.request.body[argName];

                    if (_.isNil(value) && !param.optional) {
                        throw new BadRequest(`Required argument "${argName}" is not given.`);
                    }

                    args.push(value);
                });
            }

            let EntityModel = db.model(entityName); 
            let asyncMethodName = methodName + '_';

            if (typeof EntityModel[asyncMethodName] !== 'function') {
                throw new NotFound(`RPC endpoint "${ctx.path}" not found.`);
            }

            if (options.invokeTracking) {
                app.log('verbose', `Invoking a process API [${entityName}.${methodName}] ...`);
            }

            ctx.body = await EntityModel[asyncMethodName](...args);
        });
    });    

    app.addRouter(router);
};