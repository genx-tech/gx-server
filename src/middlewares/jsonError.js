"use strict";

/**
 * Error response middleware with json
 * @module Middleware_JsonError
 */

const http = require('http');
const { _ } = require('rk-utils');

module.exports = (opt) => async (ctx, next) => {
    try {
        await next();
        if (ctx.response.status === 404 && !ctx.response.body) ctx.throw(404);
    } catch (err) {
        ctx.status = typeof err.status === 'number' ? err.status : 500;        
    
        // accepted types
        ctx.type = 'application/json';

        let errorObject = { error: err.expose ? err.message : http.STATUS_CODES[ctx.status] };
        if (ctx.appModule.env === 'development') {
            errorObject.stack = err.stack;
            errorObject.appModule = ctx.appModule.name;
        }        

        Object.assign(errorObject, _.pick(err, ['code', 'errorCode', 'payload'])); 

        if (opt && opt.withState) {
            if (typeof opt.withState === 'function') {
                Object.assign(errorObject, opt.withState(ctx));
            } else {
                let states = _.castArray(opt.withState);
                Object.assign(errorObject, _.pick(ctx.state, states));
            }
        }

        ctx.body = errorObject;

        // application
        ctx.app.emit('error', err, ctx);
    }        
};       