"use strict";

const path = require("path");
const { glob } = require("@genx/sys");
const { _, naming, text } = require("@genx/july");
const Literal = require("../enum/Literal");
const Router = require("@koa/router");
const { hasMethod } = require("../utils/Helpers");

/**
 * Gaml router.
 * @module Router_Gaml
 */

const appendId = (baseEndpoint, idName) => (idName ? `${baseEndpoint}/:${idName}` : baseEndpoint);

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
 *  /:resource                     get            find
 *  /:resource                     post           post
 *  /:resource/:id                 get            findById
 *  /:resource/:id                 put            updateById
 *  /:resource/:id                 del            deleteById
 */
module.exports = (app, baseRoute, options) => {
    let resourcePath = path.resolve(app.backendPath, options.resourcesPath || Literal.RESOURCES_PATH);

    let router = baseRoute === "/" ? new Router() : new Router({ prefix: text.dropIfEndsWith(baseRoute, '/') });

    app.useMiddleware(router, app.getMiddlewareFactory("jsonError")(options.errorOptions, app), "jsonError");

    if (options.middlewares) {
        app.useMiddlewares(router, options.middlewares);
    }

    let resourcesPath = path.join(resourcePath, "*.js");
    let files = glob.sync(resourcesPath, { nodir: true });

    _.each(files, (file) => {
        let entityName = path.basename(file, ".js");
        let controller = require(file);

        if (typeof controller === "function") {
            controller = new controller(app);
        }

        let baseEndpoint;

        if (options.remaps && entityName in options.remaps) {
            baseEndpoint = text.ensureStartsWith(text.dropIfEndsWith(options.remaps[entityName], "/"), "/");
        } else {
            baseEndpoint = text.ensureStartsWith(naming.kebabCase(entityName), "/");
        }

        let idName = naming.camelCase(entityName) + "Id";
        let endpointWithId = appendId(baseEndpoint, idName);

        if (hasMethod(controller, "find")) {
            app.addRoute(router, "get", baseEndpoint, (ctx) => controller.find(ctx));
        }

        if (hasMethod(controller, "post")) {
            app.addRoute(router, "post", baseEndpoint, (ctx) => controller.post(ctx));
        }

        if (hasMethod(controller, "findById")) {
            app.addRoute(router, "get", endpointWithId, (ctx) => controller.findById(ctx, ctx.params[idName]));
        }

        if (hasMethod(controller, "updateById")) {
            app.addRoute(router, "put", endpointWithId, (ctx) => controller.updateById(ctx, ctx.params[idName]));
        }

        if (hasMethod(controller, "deleteById")) {
            app.addRoute(router, "del", endpointWithId, (ctx) => controller.deleteById(ctx, ctx.params[idName]));
        }
    });

    app.addRouter(router);
};
