"use strict";

require("source-map-support/register");
const path = require("path");
const {
  _,
  text
} = require("@genx/july");
const {
  glob
} = require("@genx/sys");
const Router = require("@koa/router");
const Literal = require("../enum/Literal");
const {
  hasMethod
} = require("../utils/Helpers");
module.exports = (app, baseRoute, options) => {
  let resourcePath = path.resolve(app.backendPath, options.resourcesPath || Literal.RESOURCES_PATH);
  let router = baseRoute === "/" ? new Router() : new Router({
    prefix: text.dropIfEndsWith(baseRoute, "/")
  });
  app.useMiddleware(router, app.getMiddlewareFactory("jsonError")(options.errorOptions, app), "jsonError");
  if (options.middlewares) {
    app.useMiddlewares(router, options.middlewares);
  }
  let resourcesPath = path.join(resourcePath, "**", "*.js");
  let files = glob.sync(resourcesPath, {
    nodir: true
  });
  _.each(files, file => {
    let relPath = path.relative(resourcePath, file);
    let batchUrl = text.ensureStartsWith(relPath.substring(0, relPath.length - 3).split(path.sep).map(p => _.kebabCase(p)).join("/"), "/");
    let singleUrl = batchUrl + "/:id";
    let controller = require(file);
    if (typeof controller === "function") {
      controller = new controller(app);
    }
    if (hasMethod(controller, "query")) {
      app.addRoute(router, "get", batchUrl, ctx => controller.query(ctx));
    }
    if (hasMethod(controller, "create")) {
      app.addRoute(router, "post", batchUrl, ctx => controller.create(ctx));
    }
    if (hasMethod(controller, "detail")) {
      app.addRoute(router, "get", singleUrl, ctx => controller.detail(ctx));
    }
    if (hasMethod(controller, "update")) {
      app.addRoute(router, "put", singleUrl, ctx => controller.update(ctx));
    }
    if (hasMethod(controller, "remove")) {
      app.addRoute(router, "del", singleUrl, ctx => controller.remove(ctx));
    }
  });
  app.addRouter(router);
};
//# sourceMappingURL=rest.js.map