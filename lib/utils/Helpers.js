"use strict";

require("source-map-support/register");

const {
  _
} = require('@genx/july');

const {
  InvalidConfiguration
} = require('@genx/error');

const Literal = require('../enum/Literal');

const httpMethod = require('./httpMethod');

const middleware = require('./middleware');

exports.Controller = require('./Controller');

exports.requireFeatures = function (features, app, middleware) {
  let hasNotEnabled = _.find(_.castArray(features), feature => !app.enabled(feature));

  if (hasNotEnabled) {
    throw new InvalidConfiguration(`Middleware "${middleware}" requires "${hasNotEnabled}" feature to be enabled.`, app, `middlewares.${middleware}`);
  }
};

exports.httpMethod = httpMethod;
exports.middleware = middleware;

exports.hasMethod = function hasMethod(obj, name) {
  const desc = Object.getOwnPropertyDescriptor(obj, name);
  let has = !!desc && typeof desc.value === 'function';
  if (has) return true;
  let proto = Object.getPrototypeOf(obj);
  if (proto === Object.prototype) return has;
  return hasMethod(proto, name);
};

exports.defaultBackendPath = process.env.NODE_RT && process.env.NODE_RT === 'babel' ? Literal.BACKEND_SRC_PATH : Literal.BACKEND_PATH;
//# sourceMappingURL=Helpers.js.map