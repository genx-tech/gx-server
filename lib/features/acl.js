"use strict";
require("source-map-support/register");
const {
  _,
  eachAsync_
} = require('@genx/july');
const {
  Feature
} = require('..').Enums;
const {
  InvalidConfiguration
} = require('@genx/error');
module.exports = {
  type: Feature.PLUGIN,
  load_: async function (app, config) {
    const Acl = app.tryRequire('acl');
    let backend = config.backend || 'memory';
    let backendType, backendStore;
    if (backend.indexOf('.') > 0) {
      backendType = '';
    }
    switch (backend) {
      case 'memory':
        backendStore = new Acl.memoryBackend();
        break;
      case 'mongodb':
        if (!config.dataSource) {
          throw new InvalidConfiguration('"dataSource" is required for mongodb backend of acl.', app, 'acl.dataSource');
        }
        let mongodb = app.getService(config.dataSource);
        if (!mongodb) {
          throw new InvalidConfiguration(`Data source "${config.dataSource}" not found.`, app, 'acl.dataSource');
        }
        backendStore = new Acl.mongodbBackend(await mongodb.connect_(), config.prefix);
        break;
      case 'redis':
        throw new Error('to be implemented');
        break;
      default:
        throw new InvalidConfiguration('Unsupported acl backend: ' + backend, app, 'acl.backend');
    }
    app.acl = new Acl(backendStore);
  }
};
//# sourceMappingURL=acl.js.map