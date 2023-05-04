"use strict";
require("source-map-support/register");
const {
  Feature
} = require('..').Enums;
module.exports = {
  type: Feature.PLUGIN,
  load_: function (app, middlewares) {
    app.useMiddlewares(app.router, middlewares);
  }
};
//# sourceMappingURL=middlewares.js.map