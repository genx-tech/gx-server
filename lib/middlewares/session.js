"use strict";
require("source-map-support/register");
const {
  InvalidConfiguration
} = require('@genx/error');
const DEFAULT_OPTS = {
  key: 'gx-server.sid',
  prefix: 'gx-server:sess:'
};
module.exports = (options, app) => {
  const session = app.tryRequire('koa-session');
  let store = options.store || {
    type: 'memory'
  };
  if (!store.type) {
    throw new InvalidConfiguration('Missing session store type.', app, 'middlewares.session.store');
  }
  let storeObject;
  let opt = store.options || {};
  if (store.dataSource) {
    let dsService = app.getService(store.dataSource);
    Object.assign(opt, {
      url: dsService.connectionString
    });
  }
  switch (store.type) {
    case 'redis':
      storeObject = app.tryRequire('koa-redis')(opt);
      break;
    case 'mysql':
      storeObject = app.tryRequire('koa-mysql-session')(opt);
      break;
    case 'mongodb':
      const MongoStore = app.tryRequire('koa-generic-session-mongo');
      storeObject = new MongoStore(opt);
      break;
    case 'pgsql':
      storeObject = app.tryRequire('koa-pg-session')(opt);
      break;
    case 'sqlite3':
      storeObject = app.tryRequire('koa-sqlite3-session')(opt);
      break;
    case 'memory':
      const MemoryStore = app.tryRequire('koa-session-memory');
      storeObject = new MemoryStore();
      break;
    default:
      throw new InvalidConfiguration('Unsupported session store type: ' + store.type, app, 'middlewares.session.store.type');
  }
  let sessionOptions = Object.assign({}, DEFAULT_OPTS, options, {
    store: storeObject
  });
  return session(sessionOptions, app.server.koa);
};
//# sourceMappingURL=session.js.map