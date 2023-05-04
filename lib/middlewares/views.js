"use strict";
require("source-map-support/register");
const path = require('path');
const views = require('koa-views');
const Literal = require('../enum/Literal');
module.exports = function (options, app) {
  return views(path.join(app.backendPath, Literal.VIEWS_PATH), options);
};
//# sourceMappingURL=views.js.map