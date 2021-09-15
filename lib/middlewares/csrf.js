"use strict";

require("source-map-support/register");

const CSRF = require('koa-csrf');

const DEFAULT_OPTS = {
  invalidSessionSecretMessage: 'Invalid session secret',
  invalidSessionSecretStatusCode: 403,
  invalidTokenMessage: 'Invalid CSRF token',
  invalidTokenStatusCode: 403,
  excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
  disableQuery: false
};

module.exports = options => new CSRF(Object.assign({}, DEFAULT_OPTS, options));
//# sourceMappingURL=csrf.js.map