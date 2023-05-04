"use strict";

require("source-map-support/register");
const {
  _
} = require('@genx/july');
const validator = require('validator');
const {
  InvalidConfiguration
} = require('@genx/error');
const Feature = require('@genx/app/lib/enum/Feature');
module.exports = {
  type: Feature.SERVICE,
  load_: function (server, options) {
    let koa = server.router;
    server.koa = koa;
    koa.env = server.env;
    koa.proxy = options.trustProxy && validator.toBoolean(options.trustProxy);
    if ('subdomainOffset' in options && options.subdomainOffset !== 2) {
      if (options.subdomainOffset < 2) {
        throw new InvalidConfiguration('Invalid subdomainOffset. Should be larger or equal to 2.', appModule, 'koa.subdomainOffset');
      }
      koa.subdomainOffset = options.subdomainOffset;
    }
    if (options.keys) {
      if (!_.isArray(options.keys)) {
        koa.keys = [options.keys];
      } else {
        koa.keys = options.keys;
      }
    }
    koa.on('error', (err, ctx) => {
      let extra = _.pick(err, ['status', 'code', 'info']);
      if (ctx) {
        extra.request = _.pick(ctx, ['method', 'url', 'ip']);
      }
      extra.app = ctx.appModule.name;
      if (err.status && err.status < 500) {
        if (server.env === 'development') {
          extra.stack = err.stack;
        }
        server.log('warn', `[${err.status}] ` + err.message, extra);
        return;
      }
      server.logError(err);
    });
    server.httpServer = require('http').createServer(koa.callback());
    let port = options.httpPort || 2331;
    server.on('ready', () => {
      server.httpServer.listen(port, function (err) {
        if (err) throw err;
        let address = server.httpServer.address();
        let host;
        if (address.family === 'IPv6' && address.address === '::') {
          host = '127.0.0.1';
        } else {
          host = address.address;
        }
        server.host = `${host}:${address.port}`;
        server.port = address.port;
        server.log('info', `A http service is listening on port [${address.port}] ...`);
        server.emit('httpReady');
      });
    });
  }
};
//# sourceMappingURL=koa.js.map