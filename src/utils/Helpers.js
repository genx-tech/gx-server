"use strict";

const _ = require('rk-utils')._;
const { InvalidConfiguration } = require('../utils/Errors');

exports.requireFeatures = function (features, app, middleware) {
    let hasNotEnabled = _.find(_.castArray(features), feature => !app.enabled(feature));

    if (hasNotEnabled) {
        throw new InvalidConfiguration(
            `"${middleware}" requires "${hasNotEnabled}" feature to be enabled.`,
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

/**
 * Adds a status property to the class.
 * @mixin
 * @param {*} Base 
 * @param {*} STATUS 
 */
exports.withStatus = (Base, STATUS) => class extends Base {
    /**
     * Status code.
     * @member {number}
     */
    status = STATUS;
};