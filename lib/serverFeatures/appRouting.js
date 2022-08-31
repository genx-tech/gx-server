"use strict";

require("source-map-support/register");

const path = require('path');

const {
  _,
  eachAsync_
} = require('@genx/july');

const {
  fs
} = require('@genx/sys');

const {
  InvalidConfiguration
} = require('@genx/error');

const WebModule = require('../WebModule');

const {
  Feature
} = require('@genx/app');

module.exports = {
  type: Feature.PLUGIN,
  load_: async (server, routes) => eachAsync_(routes, async (config, baseRoute) => {
    if (!config.name) {
      throw new InvalidConfiguration('Missing app name.', app, `appRouting.${baseRoute}.name`);
    }

    let options = Object.assign({
      env: server.env,
      logWithAppName: server.options.logWithAppName,
      traceMiddlewares: server.options.traceMiddlewares
    }, config.options);
    let appPath;

    if (config.npmModule) {
      appPath = server.toAbsolutePath('node_modules', config.name);
    } else {
      appPath = path.join(server.appModulesPath, config.name);
    }

    let exists = (await fs.pathExists(appPath)) && (await fs.stat(appPath)).isDirectory();

    if (!exists) {
      throw new InvalidConfiguration(`App [${config.name}] not found at ${appPath}`, server, `appRouting.${baseRoute}.name`);
    }

    let app = new WebModule(server, config.name, baseRoute, appPath, options);
    app.now = server.now;
    app.__ = server.__;
    app.on('configLoaded', () => {
      if (!_.isEmpty(config.overrides)) {
        Object.assign(app.config, config.overrides);
        server.log('verbose', "App config is overrided.");
      }

      if (!_.isEmpty(config.settings)) {
        app.config.settings = Object.assign({}, app.config.settings, config.settings);
        server.log('verbose', `App settings of [${app.name}] is overrided.`);
      }

      if (!_.isEmpty(config.middlewares)) {
        let middlewaresToAppend = app.config.middlewares;
        app.config.middlewares = { ...config.middlewares
        };

        _.defaults(app.config.middlewares, middlewaresToAppend);
      }
    });
    let relativePath = path.relative(server.workingPath, appPath);
    server.log('verbose', `Loading app [${app.name}] from "${relativePath}" ...`);
    await app.start_();
    server.log('verbose', `App [${app.name}] is loaded.`);
    server.on('before:' + Feature.READY, () => {
      server.mountApp(app);
    });
  })
};
//# sourceMappingURL=appRouting.js.map