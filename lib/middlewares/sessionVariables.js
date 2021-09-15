"use strict";

require("source-map-support/register");

let sessionVariables = (options, app) => {
  let isFunc = typeof options === 'function';
  return (ctx, next) => {
    ctx.sessionVariables = isFunc ? options(ctx) : options;
    return next();
  };
};

module.exports = sessionVariables;
//# sourceMappingURL=sessionVariables.js.map