"use strict";

require("source-map-support/register");

const path = require("path");

const {
  glob
} = require("@genx/sys");

const {
  _,
  naming,
  text
} = require("@genx/july");

const Literal = require("../enum/Literal");

const Router = require("@koa/router");

const {
  hasMethod
} = require("../utils/Helpers");

const appendId = (baseEndpoint, idName) => idName ? `${baseEndpoint}/:${idName}` : baseEndpoint;

module.exports = (app, baseRoute, options) => {
  let resourcePath = path.resolve(app.backendPath, options.resourcesPath || Literal.RESOURCES_PATH);
  let router = baseRoute === "/" ? new Router() : new Router({
    prefix: text.dropIfEndsWith(baseRoute, '/')
  });
  app.useMiddleware(router, app.getMiddlewareFactory("jsonError")(options.errorOptions, app), "jsonError");

  if (options.middlewares) {
    app.useMiddlewares(router, options.middlewares);
  }

  let resourcesPath = path.join(resourcePath, "*.js");
  let files = glob.sync(resourcesPath, {
    nodir: true
  });

  _.each(files, file => {
    let entityName = path.basename(file, ".js");

    let Controller = require(file);

    let baseEndpoint;

    if (options.remaps && entityName in options.remaps) {
      baseEndpoint = text.ensureStartsWith(text.dropIfEndsWith(options.remaps[entityName], "/"), "/");
    } else {
      baseEndpoint = text.ensureStartsWith(naming.kebabCase(entityName), "/");
    }

    let idName = naming.camelCase(entityName) + "Id";
    let endpointWithId = appendId(baseEndpoint, idName);

    if (typeof Controller === "function") {
      app.addRoute(router, "get", baseEndpoint, ctx => {
        const controller = new Controller(ctx);

        if (hasMethod(controller, "find")) {
          return controller.find();
        }
      });
      app.addRoute(router, "post", baseEndpoint, ctx => {
        const controller = new Controller(ctx);

        if (hasMethod(controller, "post")) {
          return controller.post();
        }
      });
      app.addRoute(router, "get", endpointWithId, ctx => {
        const controller = new Controller(ctx);

        if (hasMethod(controller, "findById")) {
          return controller.findById(ctx.params[idName]);
        }
      });
      app.addRoute(router, "put", endpointWithId, ctx => {
        const controller = new Controller(ctx);

        if (hasMethod(controller, "updateById")) {
          return controller.updateById(ctx.params[idName]);
        }
      });
      app.addRoute(router, "del", endpointWithId, ctx => {
        const controller = new Controller(ctx);

        if (hasMethod(controller, "deleteById")) {
          return controller.deleteById(ctx.params[idName]);
        }
      });
    }
  });

  app.addRouter(router);
};
//# sourceMappingURL=gaml.js.map