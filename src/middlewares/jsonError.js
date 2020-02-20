"use strict";

/**
 * Error response middleware with json
 * @module Middleware_JsonError
 */

const http = require('http');
const { _ } = require('rk-utils');

module.exports = (opt, app) => { 
    let handler;

    if (opt && opt.customHandler) {
        handler = app.getBackendAction(opt.customHandler);
    }

    return async (ctx, next) => {
        try {
            await next();
            if (ctx.response.status === 404 && !ctx.response.body) ctx.throw(404);
        } catch (err) {
            ctx.status = typeof err.status === 'number' ? err.status : 500;        
        
            // accepted types
            ctx.type = 'application/json';

            if (handler) {
                ctx.body = await handler(ctx, err);
            } else {
                let errorObject = { 
                    error: err.expose ? err.message : http.STATUS_CODES[ctx.status],
                    ..._.pick(err, ['code', 'errorCode', 'payload']) 
                };

                if (ctx.appModule.env === 'development') {
                    errorObject.stack = err.stack;
                    errorObject.appModule = ctx.appModule.name;
                }        

                ctx.body = errorObject;
            }

            // application
            ctx.app.emit('error', err, ctx);
        }        
    } 
};       