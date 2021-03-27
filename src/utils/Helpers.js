"use strict";

const { _ } = require('rk-utils');
const { InvalidConfiguration } = require('@genx/error');
const Literal = require('../enum/Literal');
const httpMethod = require('./httpMethod');

exports.requireFeatures = function (features, app, middleware) {
    let hasNotEnabled = _.find(_.castArray(features), feature => !app.enabled(feature));

    if (hasNotEnabled) {
        throw new InvalidConfiguration(
            `Middleware "${middleware}" requires "${hasNotEnabled}" feature to be enabled.`,
            app,
            `middlewares.${middleware}`
        );
    }
};

/**
 * Http method decorator for module controller
 */
exports.httpMethod = httpMethod;

exports.hasMethod = function hasMethod(obj, name) {
    const desc = Object.getOwnPropertyDescriptor(obj, name);    
    let has = !!desc && typeof desc.value === 'function';
    if (has) return true;

    let proto = Object.getPrototypeOf(obj);
    if (proto === Object.prototype) return has;

    return hasMethod(proto, name);
};

/**
 * when running with [NODE_RT=babel], directly use source files
 */
exports.defaultBackendPath = (process.env.NODE_RT && process.env.NODE_RT === 'babel') ? Literal.BACKEND_SRC_PATH : Literal.BACKEND_PATH;