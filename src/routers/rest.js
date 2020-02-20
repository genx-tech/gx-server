"use strict";

const path = require('path');
const Util = require('rk-utils');
const _ = Util._;
const Promise = Util.Promise;
const Literal = require('../enum/Literal');
const Router = require('@koa/router');
const Controller = require('../patterns/Controller');
const { InvalidConfiguration } = require('../utils/Errors');
const { hasMethod } = require('../utils/Helpers');

/**
 * RESTful router.
 * @module Router_Rest
 */

/**
 * Create a RESTful router.
 * @param {*} app 
 * @param {string} baseRoute 
 * @param {objects} options 
 * @property {string} [options.resourcesPath]
 * @property {object|array} [options.middlewares]
 * @property {boolean} [options.withKeyValuePairInPath]
 * @property {string} [options.idRegExp]
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
 *  /:resource/:id                 delete         deleteOne_
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

    _.each(files, file => {
        let relPathWoe = path.relative(resourcePath, file).slice(0, -3);          
        let baseEndpoint, entityName = path.basename(file, '.js');

        if (options.remaps && relPathWoe in options.remaps) {
            baseEndpoint = Util.ensureLeftSlash(Util.trimRightSlash(options.remaps[relPathWoe]));
        } else {
            baseEndpoint = Util.ensureLeftSlash(relPathWoe.split(path.sep).map(p => _.kebabCase(p)).join('/'));
        }

        let idName = _.camelCase(entityName) + 'Id';
        let singleUrl = options.idRegExp ? baseEndpoint + `/:${idName}(${options.idRegExp})` : baseEndpoint + `/:${idName}`; 
        
        let controller = require(file);
        let isObj = false;
    
        if (controller.prototype instanceof Controller) {
            controller = new controller(app);
            isObj = true;
        }        

        if (hasMethod(controller, 'findMany_')) {
            app.addRoute(router, 'get', baseEndpoint, isObj ? controller.findMany_.bind(controller) : controller.findMany_);
        }

        if (hasMethod(controller, 'create_')) {
            app.addRoute(router, 'post', baseEndpoint, isObj ? controller.create_.bind(controller) : controller.create_);
        }

        if (options.withKeyValuePairInPath && hasMethod(controller, 'findOneBy_')) {
            app.addRoute(router, 'get', baseEndpoint + '/:key/:value', isObj ? controller.findOneBy_.bind(controller) : controller.findOneBy_);
        }

        if (hasMethod(controller, 'findOne_')) {
            app.addRoute(router, 'get', singleUrl, isObj ? controller.findOne_.bind(controller) : controller.findOne_);
        }

        if (hasMethod(controller, 'updateOne_')) {
            app.addRoute(router, 'put', singleUrl, isObj ? controller.updateOne_.bind(controller) : controller.updateOne_);
        }

        if (hasMethod(controller, 'deleteOne_')) {
            app.addRoute(router, 'del', singleUrl, isObj ? controller.deleteOne_.bind(controller) : controller.deleteOne_);
        }
    });

    app.addRouter(router);
};