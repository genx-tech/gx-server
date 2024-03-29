"use strict";
require("source-map-support/register");
const HttpCode = require('http-status-codes');
module.exports = (options, app) => {
  return async (ctx, next) => {
    if (ctx.isAuthenticated()) {
      return next();
    }
    if (options.successReturnToOrRedirect && ctx.session) {
      ctx.session.returnTo = ctx.originalUrl || ctx.url;
    }
    if (!options.loginUrl) {
      ctx.throw(HttpCode.UNAUTHORIZED, 'authentication required');
    }
    return ctx.redirect(options.loginUrl);
  };
};
//# sourceMappingURL=passportCheck.js.map