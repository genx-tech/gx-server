"use strict";
require("source-map-support/register");
const path = require('path');
const {
  Feature
} = require('..').Enums;
const {
  dependsOn
} = require('@genx/app/lib/utils/Helpers');
module.exports = {
  type: Feature.PLUGIN,
  load_: function (app, config) {
    dependsOn('passport', app, 'oauth2');
    const oauth2orize = app.tryRequire('oauth2orize-koa');
    const server = oauth2orize.createServer();
    let strategy, strategyScript;
    try {
      strategyScript = path.join(app.backendPath, 'oauth2', 'strategy.js');
      let strategyInitiator = require(strategyScript);
      strategy = strategyInitiator(app, server);
      if (!strategy) {
        throw new Error(`Invalid oauth2 strategy.`);
      }
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error(`oauth2 strategy file "${strategyScript}" not found.`);
      }
      throw error;
    }
    server.serializeClient(strategy.serializeClient);
    server.deserializeClient(strategy.deserializeClient);
    server.grant(oauth2orize.grant.code(strategy.grantCode));
    server.exchange(oauth2orize.exchange.code(strategy.exchangeCode));
    app.registerMiddlewareFactory('oauth2Authorization', () => ["passportCheck", server.authorize(strategy.authorize)]);
    app.registerMiddlewareFactory('oauth2Decision', () => ["passportCheck", server.decision()]);
    app.registerMiddlewareFactory('oauth2Token', () => [["passportAuth", {
      "strategy": ['basic', 'oauth2-client-password'],
      "options": {
        session: false
      }
    }], server.token(), server.errorHandler()]);
  }
};
//# sourceMappingURL=oauth2.js.map