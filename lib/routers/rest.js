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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXJzL3Jlc3QuanMiXSwibmFtZXMiOlsicGF0aCIsInJlcXVpcmUiLCJfIiwidGV4dCIsImdsb2IiLCJSb3V0ZXIiLCJMaXRlcmFsIiwiaGFzTWV0aG9kIiwibW9kdWxlIiwiZXhwb3J0cyIsImFwcCIsImJhc2VSb3V0ZSIsIm9wdGlvbnMiLCJyZXNvdXJjZVBhdGgiLCJyZXNvbHZlIiwiYmFja2VuZFBhdGgiLCJyZXNvdXJjZXNQYXRoIiwiUkVTT1VSQ0VTX1BBVEgiLCJyb3V0ZXIiLCJwcmVmaXgiLCJkcm9wSWZFbmRzV2l0aCIsInVzZU1pZGRsZXdhcmUiLCJnZXRNaWRkbGV3YXJlRmFjdG9yeSIsImVycm9yT3B0aW9ucyIsIm1pZGRsZXdhcmVzIiwidXNlTWlkZGxld2FyZXMiLCJqb2luIiwiZmlsZXMiLCJzeW5jIiwibm9kaXIiLCJlYWNoIiwiZmlsZSIsInJlbFBhdGgiLCJyZWxhdGl2ZSIsImJhdGNoVXJsIiwiZW5zdXJlU3RhcnRzV2l0aCIsInN1YnN0cmluZyIsImxlbmd0aCIsInNwbGl0Iiwic2VwIiwibWFwIiwicCIsImtlYmFiQ2FzZSIsInNpbmdsZVVybCIsImNvbnRyb2xsZXIiLCJhZGRSb3V0ZSIsImN0eCIsInF1ZXJ5IiwiY3JlYXRlIiwiZGV0YWlsIiwidXBkYXRlIiwicmVtb3ZlIiwiYWRkUm91dGVyIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztBQUVBLE1BQU1BLElBQUksR0FBR0MsT0FBTyxDQUFDLE1BQUQsQ0FBcEI7O0FBQ0EsTUFBTTtBQUFFQyxFQUFBQSxDQUFGO0FBQUtDLEVBQUFBO0FBQUwsSUFBY0YsT0FBTyxDQUFDLFlBQUQsQ0FBM0I7O0FBQ0EsTUFBTTtBQUFFRyxFQUFBQTtBQUFGLElBQVdILE9BQU8sQ0FBQyxXQUFELENBQXhCOztBQUNBLE1BQU1JLE1BQU0sR0FBR0osT0FBTyxDQUFDLGFBQUQsQ0FBdEI7O0FBQ0EsTUFBTUssT0FBTyxHQUFHTCxPQUFPLENBQUMsaUJBQUQsQ0FBdkI7O0FB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QUcsQ0FBQ21DLFFBQUosQ0FBYTNCLE1BQWIsRUFBcUIsS0FBckIsRUFBNEJ5QixTQUE1QixFQUF3Q0csR0FBRCxJQUFTRixVQUFVLENBQUNLLE1BQVgsQ0FBa0JILEdBQWxCLENBQWhEO0FBQ0g7O0FBRUQsUUFBSXZDLFNBQVMsQ0FBQ3FDLFVBQUQsRUFBYSxRQUFiLENBQWIsRUFBcUM7QUFDakNsQyxNQUFBQSxHQUFHLENBQUNtQyxRQUFKLENBQWEzQixNQUFiLEVBQXFCLEtBQXJCLEVBQTRCeUIsU0FBNUIsRUFBd0NHLEdBQUQsSUFBU0YsVUFBVSxDQUFDTSxNQUFYLENBQWtCSixHQUFsQixDQUFoRDtBQUNIOztBQUVELFFBQUl2QyxTQUFTLENBQUNxQyxVQUFELEVBQWEsUUFBYixDQUFiLEVBQXFDO0FBQ2pDbEMsTUFBQUEsR0FBRyxDQUFDbUMsUUFBSixDQUFhM0IsTUFBYixFQUFxQixLQUFyQixFQUE0QnlCLFNBQTVCLEVBQXdDRyxHQUFELElBQVNGLFVBQVUsQ0FBQ08sTUFBWCxDQUFrQkwsR0FBbEIsQ0FBaEQ7QUFDSDtBQUNKLEdBckNEOztBQXVDQXBDLEVBQUFBLEdBQUcsQ0FBQzBDLFNBQUosQ0FBY2xDLE1BQWQ7QUFDSCxDQXRERCIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCB7IF8sIHRleHQgfSA9IHJlcXVpcmUoXCJAZ2VueC9qdWx5XCIpO1xuY29uc3QgeyBnbG9iIH0gPSByZXF1aXJlKFwiQGdlbngvc3lzXCIpO1xuY29uc3QgUm91dGVyID0gcmVxdWlyZShcIkBrb2Evcm91dGVyXCIpO1xuY29uc3QgTGl0ZXJhbCA9IHJlcXVpcmUoXCIuLi9lbnVtL0xpdGVyYWxcIik7XG5jb25zdCB7IGhhc01ldGhvZCB9ID0gcmVxdWlyZShcIi4uL3V0aWxzL0hlbHBlcnNcIik7XG5cbi8qKlxuICogUkVTVGZ1bCByb3V0ZXIuXG4gKiBAbW9kdWxlIFJvdXRlcl9SZXN0XG4gKi9cblxuLyoqXG4gKiBDcmVhdGUgYSBSRVNUZnVsIHJvdXRlci5cbiAqIEBwYXJhbSB7Kn0gYXBwXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVJvdXRlXG4gKiBAcGFyYW0ge29iamVjdHN9IG9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5yZXNvdXJjZXNQYXRoXVxuICogQHByb3BlcnR5IHtvYmplY3R8YXJyYXl9IFtvcHRpb25zLm1pZGRsZXdhcmVzXVxuICogQGV4YW1wbGVcbiAqICAnPGJhc2UgcGF0aD4nOiB7XG4gKiAgICAgIHJlc3Q6IHtcbiAqICAgICAgICAgIHJlc291cmNlc1BhdGg6XG4gKiAgICAgICAgICBtaWRkbGV3YXJlczpcbiAqICAgICAgfVxuICogIH1cbiAqXG4gKiAgcm91dGUgICAgICAgICAgICAgICAgICAgICAgICAgIGh0dHAgbWV0aG9kICAgIGZ1bmN0aW9uIG9mIGN0cmxcbiAqICAvOnJlc291cmNlICAgICAgICAgICAgICAgICAgICAgZ2V0ICAgICAgICAgICAgcXVlcnlcbiAqICAvOnJlc291cmNlICAgICAgICAgICAgICAgICAgICAgcG9zdCAgICAgICAgICAgY3JlYXRlXG4gKiAgLzpyZXNvdXJjZS86aWQgICAgICAgICAgICAgICAgIGdldCAgICAgICAgICAgIGRldGFpbFxuICogIC86cmVzb3VyY2UvOmlkICAgICAgICAgICAgICAgICBwdXQgICAgICAgICAgICB1cGRhdGVcbiAqICAvOnJlc291cmNlLzppZCAgICAgICAgICAgICAgICAgZGVsZXRlICAgICAgICAgcmVtb3ZlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKGFwcCwgYmFzZVJvdXRlLCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IHJlc291cmNlUGF0aCA9IHBhdGgucmVzb2x2ZShhcHAuYmFja2VuZFBhdGgsIG9wdGlvbnMucmVzb3VyY2VzUGF0aCB8fCBMaXRlcmFsLlJFU09VUkNFU19QQVRIKTtcblxuICAgIGxldCByb3V0ZXIgPSBiYXNlUm91dGUgPT09IFwiL1wiID8gbmV3IFJvdXRlcigpIDogbmV3IFJvdXRlcih7IHByZWZpeDogdGV4dC5kcm9wSWZFbmRzV2l0aChiYXNlUm91dGUsIFwiL1wiKSB9KTtcblxuICAgIGFwcC51c2VNaWRkbGV3YXJlKHJvdXRlciwgYXBwLmdldE1pZGRsZXdhcmVGYWN0b3J5KFwianNvbkVycm9yXCIpKG9wdGlvbnMuZXJyb3JPcHRpb25zLCBhcHApLCBcImpzb25FcnJvclwiKTtcblxuICAgIGlmIChvcHRpb25zLm1pZGRsZXdhcmVzKSB7XG4gICAgICAgIGFwcC51c2VNaWRkbGV3YXJlcyhyb3V0ZXIsIG9wdGlvbnMubWlkZGxld2FyZXMpO1xuICAgIH1cblxuICAgIGxldCByZXNvdXJjZXNQYXRoID0gcGF0aC5qb2luKHJlc291cmNlUGF0aCwgXCIqKlwiLCBcIiouanNcIik7XG4gICAgbGV0IGZpbGVzID0gZ2xvYi5zeW5jKHJlc291cmNlc1BhdGgsIHsgbm9kaXI6IHRydWUgfSk7XG5cbiAgICBfLmVhY2goZmlsZXMsIChmaWxlKSA9PiB7XG4gICAgICAgIGxldCByZWxQYXRoID0gcGF0aC5yZWxhdGl2ZShyZXNvdXJjZVBhdGgsIGZpbGUpO1xuICAgICAgICBsZXQgYmF0Y2hVcmwgPSB0ZXh0LmVuc3VyZVN0YXJ0c1dpdGgoXG4gICAgICAgICAgICByZWxQYXRoXG4gICAgICAgICAgICAgICAgLnN1YnN0cmluZygwLCByZWxQYXRoLmxlbmd0aCAtIDMpXG4gICAgICAgICAgICAgICAgLnNwbGl0KHBhdGguc2VwKVxuICAgICAgICAgICAgICAgIC5tYXAoKHApID0+IF8ua2ViYWJDYXNlKHApKVxuICAgICAgICAgICAgICAgIC5qb2luKFwiL1wiKSxcbiAgICAgICAgICAgIFwiL1wiXG4gICAgICAgICk7XG4gICAgICAgIGxldCBzaW5nbGVVcmwgPSBiYXRjaFVybCArIFwiLzppZFwiO1xuXG4gICAgICAgIGxldCBjb250cm9sbGVyID0gcmVxdWlyZShmaWxlKTtcblxuICAgICAgICBpZiAodHlwZW9mIGNvbnRyb2xsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29udHJvbGxlciA9IG5ldyBjb250cm9sbGVyKGFwcCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzTWV0aG9kKGNvbnRyb2xsZXIsIFwicXVlcnlcIikpIHtcbiAgICAgICAgICAgIGFwcC5hZGRSb3V0ZShyb3V0ZXIsIFwiZ2V0XCIsIGJhdGNoVXJsLCAoY3R4KSA9PiBjb250cm9sbGVyLnF1ZXJ5KGN0eCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc01ldGhvZChjb250cm9sbGVyLCBcImNyZWF0ZVwiKSkge1xuICAgICAgICAgICAgYXBwLmFkZFJvdXRlKHJvdXRlciwgXCJwb3N0XCIsIGJhdGNoVXJsLCAoY3R4KSA9PiBjb250cm9sbGVyLmNyZWF0ZShjdHgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNNZXRob2QoY29udHJvbGxlciwgXCJkZXRhaWxcIikpIHtcbiAgICAgICAgICAgIGFwcC5hZGRSb3V0ZShyb3V0ZXIsIFwiZ2V0XCIsIHNpbmdsZVVybCwgKGN0eCkgPT4gY29udHJvbGxlci5kZXRhaWwoY3R4KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzTWV0aG9kKGNvbnRyb2xsZXIsIFwidXBkYXRlXCIpKSB7XG4gICAgICAgICAgICBhcHAuYWRkUm91dGUocm91dGVyLCBcInB1dFwiLCBzaW5nbGVVcmwsIChjdHgpID0+IGNvbnRyb2xsZXIudXBkYXRlKGN0eCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc01ldGhvZChjb250cm9sbGVyLCBcInJlbW92ZVwiKSkge1xuICAgICAgICAgICAgYXBwLmFkZFJvdXRlKHJvdXRlciwgXCJkZWxcIiwgc2luZ2xlVXJsLCAoY3R4KSA9PiBjb250cm9sbGVyLnJlbW92ZShjdHgpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXBwLmFkZFJvdXRlcihyb3V0ZXIpO1xufTtcbiJdfQ==