"use strict";

require("source-map-support/register");
const requestIp = require('request-ip');
module.exports = () => {
  return async (ctx, next) => {
    const ip = requestIp.getClientIp(ctx.req);
    ctx.request.ip = ip;
    return next();
  };
};
//# sourceMappingURL=ip.js.map