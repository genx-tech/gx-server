"use strict";

const path = require('path');
const Util = require('rk-utils');
const _ = Util._;
const Literal = require('../enum/Literal');
const Router = require('@koa/router');
const Controller = require('../patterns/Controller');
const { hasMethod } = require('../utils/Helpers');

/**
 * RESTful router.
 * @module Router_Rest
 */

const appendId = (baseEndpoint, idName) => idName ? `${baseEndpoint}/:${idName}` : baseEndpoint; 

const getBaseEndpoint = (endpoint, remaps, controller, action, idName) => {
    if (!remaps) return endpoint;
    
    let controllerAction = controller + '.' + action;
    if (controllerAction in remaps) {
        return appendId(remaps[controllerAction], idName);
    }

    if (!controllerAction.endsWith('_')) {
        controllerAction += '_';
        if (controllerAction in remaps) {
            return appendId(remaps[controllerAction], idName);
        }
    }

    return endpoint;
};

/*
const batchQuery_ = async (ctx) => {

    

};
*/

/**
 * Create a RESTful router.
 * @param {*} app 
 * @param {string} baseRoute 
 * @param {objects} options 
 * @property {string} [options.resourcesPath]
 * @property {object|array} [options.middlewares]
 * @example
 *  '<base path>': {
 *      rest: {
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

    let resourcesPath = path.join(resourcePath, "**", "*.js");
    let files = Util.glob.sync(resourcesPath, {nodir: true});

    /*
    if (options.batchQuery) {
        app.addRoute(router, 'post', options.batchQuery, batchQuery_);
    }*/

    _.each(files, file => {
        let relPathWoe = path.relative(resourcePath, file).slice(0, -3);          
        let baseEndpoint;

        if (options.remaps && relPathWoe in options.remaps) {
            baseEndpoint = Util.ensureLeftSlash(Util.trimRightSlash(options.remaps[relPathWoe]));                
        } else {
            baseEndpoint = Util.ensureLeftSlash(relPathWoe.split(path.sep).map(p => _.kebabCase(p)).join('/'));
        }

        let entityName = path.basename(file, '.js');
        let idName = _.camelCase(entityName) + 'Id';
        let endpointWithId = appendId(baseEndpoint, idName);
        
        let controller = require(file);
        let isObj = false;
    
        if (controller.prototype instanceof Controller) {
            controller = new controller(app);
            isObj = true;
        }        

        if (hasMethod(controller, 'findMany_')) {            
            app.addRoute(router, 'get', getBaseEndpoint(baseEndpoint, options.remaps, relPathWoe, 'findMany'), isObj ? controller.findMany_.bind(controller) : controller.findMany_);
        }

        if (hasMethod(controller, 'create_')) {
            app.addRoute(router, 'post', getBaseEndpoint(baseEndpoint, options.remaps, relPathWoe, 'create'), isObj ? controller.create_.bind(controller) : controller.create_);
        }

        if (hasMethod(controller, 'findOne_')) {
            app.addRoute(router, 'get', getBaseEndpoint(endpointWithId, options.remaps, relPathWoe, 'findOne', idName), isObj ? controller.findOne_.bind(controller) : controller.findOne_);
        }

        if (hasMethod(controller, 'updateOne_')) {
            app.addRoute(router, 'put', getBaseEndpoint(endpointWithId, options.remaps, relPathWoe, 'updateOne', idName), isObj ? controller.updateOne_.bind(controller) : controller.updateOne_);
        }

        if (hasMethod(controller, 'deleteOne_')) {
            app.addRoute(router, 'del', getBaseEndpoint(endpointWithId, options.remaps, relPathWoe, 'deleteOne', idName), isObj ? controller.deleteOne_.bind(controller) : controller.deleteOne_);
        }
    });

    app.addRouter(router);
};