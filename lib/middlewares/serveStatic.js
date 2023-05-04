"use strict";
require("source-map-support/register");
const koaStatic = require('koa-static');
let serveStatic = (options, app) => koaStatic(app.publicPath, options);
module.exports = serveStatic;
//# sourceMappingURL=serveStatic.js.map