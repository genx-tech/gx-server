"use strict";

require("source-map-support/register");

const path = require("path");

const Literal = require("./enum/Literal");

const {
  defaultBackendPath
} = require("./utils/Helpers");

const ModuleBase = Base => class extends Base {
  constructor(server, name, appPath, options) {
    super(name, Object.assign({
      workingPath: appPath,
      configPath: path.join(appPath, Literal.DEFAULT_CONFIG_PATH)
    }, options));
    this.server = server;
    this.isServer = false;
    this.backendPath = this.toAbsolutePath(this.options.backendPath || defaultBackendPath);
  }

  getService(name, currentModuleOnly) {
    return super.getService(name) || !currentModuleOnly && this.server.getService(name);
  }

  enabled(feature, currentModuleOnly) {
    return super.enabled(feature) || !currentModuleOnly && this.server.enabled(feature);
  }

  require(relativePath) {
    let modPath = path.join(this.backendPath, relativePath);
    return require(modPath);
  }

  requireFromLib(libName, relativePath) {
    return this.server.requireFromLib(libName, relativePath);
  }

  log(level, message, ...rest) {
    if (this.options.logWithAppName) {
      message = "[" + this.name + "] " + message;
    }

    if (this.logger) {
      this.logger.log(level, message, ...rest);
    } else {
      this.server.log(level, message, ...rest);
    }

    return this;
  }

  _getFeatureFallbackPath() {
    let pathArray = super._getFeatureFallbackPath();

    pathArray.splice(1, 0, path.resolve(this.backendPath, Literal.FEATURES_PATH));
    return pathArray;
  }

};

module.exports = ModuleBase;
//# sourceMappingURL=ModuleBase.js.map