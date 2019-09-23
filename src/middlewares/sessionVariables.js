"use strict";

/**
 * Middleware to prepare session-spe
 * @module Middleware_SessionVariables
 */

let sessionVariables = (options, app) => {   
    let isFunc = typeof options === 'function';

    return (ctx, next) => {
        ctx.sessionVariables = isFunc ? options(ctx) : options;
        
        return next();
    };
};

module.exports = sessionVariables;