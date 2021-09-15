"use strict";

require("source-map-support/register");

const path = require('path');

const {
  _,
  eachAsync_
} = require('@genx/july');

const {
  Runable,
  ServiceContainer
} = require('@genx/app');

const Routable = require('./Routable');

const Literal = require('./enum/Literal');

const {
  defaultBackendPath
} = require('./utils/Helpers');

class WebServer extends Routable(Runable(ServiceContainer)) {
  constructor(name, options) {
    if (typeof options === 'undefined' && _.isPlainObject(name)) {
      options = name;
      name = undefined;
    }

    super(name || 'server', Object.assign({
      configName: Literal.SERVER_CFG_NAME
    }, options));
    this.server = this;
    this.isServer = true;
    this.backendPath = this.toAbsolutePath(this.options.backendPath || defaultBackendPath);
    this.appModulesPath = this.toAbsolutePath(this.options.appModulesPath || Literal.APP_MODULES_PATH);
    this.route = "/";
    this.on('configLoaded', () => {
      this.loadMiddlewaresFrom(path.resolve(__dirname, Literal.MIDDLEWARES_PATH));
    });
  }

  async stop_() {
    if (this.started) {
      if (this.appModules) {
        await eachAsync_(this.appModules, app => app.stop_());
        delete this.appModules;
        delete this.appModulesByAlias;
      }
    }

    if (this.httpServer) {
      await new Promise((resolve, reject) => {
        this.httpServer.close(err => {
          if (err) return reject(err);
          resolve();
        });
      });
      delete this.httpServer;
      this.log('info', `The http service is stopped.`);
    }

    return super.stop_();
  }

  mountApp(app) {
    if (!this.appModules) {
      this.appModules = {};
      this.appModulesByAlias = {};
    }

    assert: !this.appModules.hasOwnProperty(app.route);

    this.mountRouter(app.route, app.router);
    this.appModules[app.route] = app;

    if (app.name in this.appModulesByAlias) {
      let existingApp = this.appModulesByAlias[app.name];
      this.appModulesByAlias[`${existingApp.name}[@${existingApp.route}]`] = existingApp;
      delete this.appModulesByAlias[app.name];
      this.appModulesByAlias[`${app.name}[@${app.route}]`] = app;
    } else {
      this.appModulesByAlias[app.name] = app;
    }

    this.log('verbose', `All routes from app [${app.name}] are mounted under "${app.route}".`);
  }

  getAppByRoute(p) {
    return this.appModules[p];
  }

  getAppByAlias(a) {
    return this.appModulesByAlias[a];
  }

  requireFromApp(appName, relativePath) {
    const app = this.getAppByAlias(appName);
    return app.require(relativePath);
  }

  getService(name) {
    let pos = name.indexOf(':');

    if (pos === -1) {
      return super.getService(name);
    }

    let modAlias = name.substr(0, pos);
    name = name.substr(pos + 1);
    let app = this.getAppByAlias(modAlias);
    return app && app.getService(name, true);
  }

  _getFeatureFallbackPath() {
    let pathArray = super._getFeatureFallbackPath();

    pathArray.splice(1, 0, path.resolve(__dirname, Literal.FEATURES_PATH), path.resolve(__dirname, Literal.APP_FEATURES_PATH), path.resolve(__dirname, Literal.SERVER_FEATURES_PATH));
    return pathArray;
  }

}

module.exports = WebServer;
//# sourceMappingURL=WebServer.js.map