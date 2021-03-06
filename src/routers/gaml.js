"use strict";

const path = require('path');
const Util = require('rk-utils');
const _ = Util._;
const fs = Util.fs;
const Literal = require('../enum/Literal');
const Router = require('@koa/router');
const Controller = require('../patterns/Controller');
const { hasMethod } = require('../utils/Helpers');

/**
 * Gaml router.
 * @module Router_Gaml
 */

const appendId = (baseEndpoint, idName) => idName ? `${baseEndpoint}/:${idName}` : baseEndpoint; 


/*
const batchQuery_ = async (ctx) => {

    

};
*/

/**
 * Create a gaml router.
 * @param {*} app 
 * @param {string} baseRoute 
 * @param {objects} options 
 * @property {string} [options.resourcesPath]
 * @property {object|array} [options.middlewares]
 * @example
 *  '<base path>': {
 *      gaml: {
 *          resourcesPath:
 *          middlewares:
 *      }
 *  }
 *  
 *  route                          http method    function of ctrl
 *  /:resource                     get            findMany_ 
 *  /:resource                     post           create_
 *  /:resource/:unique-key/:value  get            findOneBy_
 *  /:resource/:id                 get            findOne_
 *  /:resource/:id                 put            updateOne_
 *  /:resource/:id                 del            deleteOne_
 */
module.exports = (app, baseRoute, options) => {
    let resourcePath = path.resolve(app.backendPath, options.resourcesPath || Literal.RESOURCES_PATH);
    
    let router = baseRoute === '/' ? new Router() : new Router({prefix: baseRoute});

    app.useMiddleware(router, app.getMiddlewareFactory('jsonError')(options.errorOptions, app), 'jsonError');

    if (options.middlewares) {
        app.useMiddlewares(router, options.middlewares);
    }

    let resourcesPath = path.join(resourcePath, "*.js");
    let files = Util.glob.sync(resourcesPath, {nodir: true});

    /*
    if (options.batchQuery) {
        app.addRoute(router, 'post', options.batchQuery, batchQuery_);
    }*/

    _.each(files, file => {
        let entityName = path.basename(file, '.js');
        
        let customPath = path.join(resourcePath, 'custom', entityName + '.js');
        let controller = require(file);

        if (fs.existsSync(customPath)) {
            let subClassFactory = require(customPath);
            controller = subClassFactory(controller);
        }

        let baseEndpoint;

        if (options.remaps && entityName in options.remaps) {
            baseEndpoint = Util.ensureLeftSlash(Util.trimRightSlash(options.remaps[entityName]));                
        } else {
            baseEndpoint = Util.ensureLeftSlash(_.kebabCase(entityName));
        }
        
        let idName = _.camelCase(entityName) + 'Id';
        let endpointWithId = appendId(baseEndpoint, idName);        

        if (hasMethod(controller, 'find')) {            
            app.addRoute(router, 'get', baseEndpoint, (ctx) => controller.find(ctx));
        }

        if (hasMethod(controller, 'post')) {
            app.addRoute(router, 'post', baseEndpoint, (ctx) => controller.post(ctx));
        }

        if (hasMethod(controller, 'findById')) {
            app.addRoute(router, 'get', endpointWithId, (ctx) => controller.findById(ctx, ctx.params[idName]));
        }

        if (hasMethod(controller, 'updateById')) {
            app.addRoute(router, 'put', endpointWithId, (ctx) => controller.updateById(ctx, ctx.params[idName]));
        }

        if (hasMethod(controller, 'deleteById')) {
            app.addRoute(router, 'del', endpointWithId, (ctx) => controller.deleteById(ctx, ctx.params[idName]));
        }
    });

    app.addRouter(router);
};