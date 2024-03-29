"use strict";
require("source-map-support/register");
const {
  _
} = require('@genx/july');
const {
  Feature
} = require('..').Enums;
const {
  InvalidConfiguration
} = require('@genx/error');
module.exports = {
  type: Feature.INIT,
  load_: (app, factories) => {
    _.forOwn(factories, (factoryInfo, name) => {
      app.registerMiddlewareFactory(name, (opt, ownerApp) => {
        assert: _.isEmpty(opt), `Pre-configured middleware factory "${name}" should be used with empty options.`;
        let chains;
        if (_.isPlainObject(factoryInfo)) {
          chains = [];
          _.forOwn(factoryInfo, (options, middleware) => {
            chains.push(app.getMiddlewareFactory(middleware)(options, ownerApp));
          });
        } else if (Array.isArray(factoryInfo)) {
          chains = factoryInfo.map((middlewareInfo, i) => {
            if (_.isPlainObject(middlewareInfo)) {
              if (!middlewareInfo.name) {
                throw new InvalidConfiguration('Missing referenced middleware name.', app, `middlewareFactory.${name}[${i}].name`);
              }
              return app.getMiddlewareFactory(middlewareInfo.name)(middlewareInfo.options, ownerApp);
            }
            if (Array.isArray(middlewareInfo)) {
              if (middlewareInfo.length < 1 || middlewareInfo.length > 2 || typeof middlewareInfo[0] !== 'string') {
                throw new InvalidConfiguration('Invalid middleware factory item config.', app, `middlewareFactory.${name}[${i}]`);
              }
              return app.getMiddlewareFactory(middlewareInfo[0])(middlewareInfo.length > 1 ? middlewareInfo[1] : undefined, ownerApp);
            }
            if (typeof middlewareInfo === 'string') {
              return app.getMiddlewareFactory(middlewareInfo)(undefined, ownerApp);
            }
            throw new InvalidConfiguration('Invalid middleware factory item config.', app, `middlewareFactory.${name}[${i}]`);
          });
        } else {
          throw new InvalidConfiguration('Invalid middleware factory config.', app, `middlewareFactory.${name}`);
        }
        return chains.length === 1 ? chains[0] : chains;
      });
    });
  }
};
//# sourceMappingURL=middlewareFactory.js.map