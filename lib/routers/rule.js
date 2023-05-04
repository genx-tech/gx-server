"use strict";

require("source-map-support/register");
const {
  _,
  text
} = require("@genx/july");
const Router = require("@koa/router");
const {
  InvalidConfiguration
} = require("@genx/error");
const Literal = require("../enum/Literal");
function load_(app, baseRoute, options) {
  let router = baseRoute === "/" ? new Router() : new Router({
    prefix: text.dropIfEndsWith(baseRoute, "/")
  });
  if (options.middlewares) {
    app.useMiddlewares(router, options.middlewares);
  }
  _.forOwn(options.rules || {}, (methods, subRoute) => {
    let pos = subRoute.indexOf(":/");
    if (pos !== -1) {
      if (pos === 0) {
        throw new InvalidConfiguration("Invalid route rule syntax: " + subRoute, app, `routing[${baseRoute}].rule.rules`);
      }
      let embeddedMethod = subRoute.substr(0, pos).toLocaleLowerCase();
      subRoute = subRoute.substr(pos + 2);
      methods = {
        [embeddedMethod]: methods
      };
    }
    subRoute = text.ensureStartsWith(subRoute, "/");
    if (typeof methods === "string" || Array.isArray(methods)) {
      methods = {
        get: methods
      };
    }
    _.forOwn(methods, (middlewares, method) => {
      if (!Literal.ALLOWED_HTTP_METHODS.has(method) && method !== "all") {
        throw new InvalidConfiguration("Unsupported http method: " + method, app, `routing[${baseRoute}].rule.rules[${subRoute}]`);
      }
      app.addRoute(router, method, subRoute, middlewares);
    });
  });
  app.addRouter(router);
}
module.exports = load_;
//# sourceMappingURL=rule.js.map