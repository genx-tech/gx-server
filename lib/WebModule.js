"use strict";

require("source-map-support/register");
const path = require('path');
const {
  _,
  text
} = require('@genx/july');
const {
  ServiceContainer
} = require('@genx/app');
const ModuleBase = require('./ModuleBase');
const Routable = require('./Routable');
const Literal = require('./enum/Literal');
class WebModule extends ModuleBase(Routable(ServiceContainer)) {
  constructor(server, name, route, appPath, options) {
    super(server, name, appPath, options);
    this.route = text.ensureStartsWith(text.dropIfEndsWith(route, '/'), '/');
  }
  requireFromApp(appName, relativePath) {
    return this.server.requireFromApp(appName, relativePath);
  }
  _getFeatureFallbackPath() {
    let pathArray = super._getFeatureFallbackPath();
    pathArray.splice(2, 0, path.resolve(__dirname, Literal.APP_FEATURES_PATH));
    return pathArray;
  }
}
module.exports = WebModule;
//# sourceMappingURL=WebModule.js.map