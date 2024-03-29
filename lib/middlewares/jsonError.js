"use strict";
require("source-map-support/register");
const http = require('http');
module.exports = (opt, app) => {
  let handler;
  if (opt && opt.customHandler) {
    handler = app.getBackendAction(opt.customHandler);
  }
  if (!handler) {
    var _app$settings;
    const apiWrapper = app.getService(((_app$settings = app.settings) === null || _app$settings === void 0 ? void 0 : _app$settings.apiWrapperService) || 'apiWrapper');
    handler = apiWrapper && apiWrapper.wrapError;
  }
  return async (ctx, next) => {
    try {
      await next();
      if (ctx.errorHandled) {
        return;
      }
      if (ctx.status >= 400) {
        if (ctx.type === 'text/plain') {
          ctx.throw(ctx.status, ctx.body);
        } else {
          ctx.throw(ctx.status);
        }
      }
    } catch (err) {
      ctx.status = typeof err.status === 'number' && err.status >= 100 ? err.status : 500;
      ctx.type = 'application/json';
      if (handler) {
        try {
          ctx.body = await handler(ctx, err);
          ctx.app.emit('error', err, ctx);
          ctx.errorHandled = true;
          return;
        } catch (error) {
          error.innerError = err;
          err = error;
        }
      }
      ctx.body = {
        error: err.expose && err.message ? err.message : http.STATUS_CODES[ctx.status]
      };
      ctx.app.emit('error', err, ctx);
    }
  };
};
//# sourceMappingURL=jsonError.js.map