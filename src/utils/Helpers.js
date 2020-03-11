"use strict";

const { _, hasKeyByPath, getValueByPath } = require('rk-utils');
const { InvalidConfiguration, BadRequest } = require('../utils/Errors');
const Literal = require('../enum/Literal');

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

exports.hasMethod = function hasMethod(obj, name) {
    const desc = Object.getOwnPropertyDescriptor(obj, name);    
    let has = !!desc && typeof desc.value === 'function';
    if (has) return true;

    let proto = Object.getPrototypeOf(obj);
    if (proto === Object.prototype) return has;

    return hasMethod(proto, name);
};

exports.getValueFromCtx = (ctx, name, type, optional, defaultValue, sources) => {
    sources ?? (sources = ctx.method === 'GET' ? 
        ['query'] : 
        ((type.name === 'binary' || type.name === 'object') ? 
            ['body'] : 
            ['query', 'body']));

    let keyPath;
    let source = _.find(sources, source => {
        keyPath = source + '.' + name;
        return hasKeyByPath(ctx.request, keyPath) ;        
    });

    if (!source) {
        if (optional) return defaultValue;
        throw new BadRequest(`"${name}" is required.`);
    }

    let value = getValueByPath(ctx.request, keyPath);
    if (_.isNil(value)) {
        return value;
    }

    return type.sanitize(value);
};

exports.expectToBeOneOf = (name, value, list, forceTo) => {
    (list instanceof Set) || (list = new Set(list));
    if (!list.has(value)) {
        if (!_.isNil(forceTo)) {
            return forceTo;
        }

        throw new BadRequest(`Value of "${name}" should be one of [${Array.from(list).join(', ')}].`);
    }

    return value;
}

/**
 * when running with [NODE_RT=babel], directly use source files
 */
exports.defaultBackendPath = (process.env.NODE_RT && process.env.NODE_RT === 'babel') ? Literal.BACKEND_SRC_PATH : Literal.BACKEND_PATH;