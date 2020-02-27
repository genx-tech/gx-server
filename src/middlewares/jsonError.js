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
            ctx.type = 'application/json';

            // accepted types
            if (handler) {      
                try {                    
                    ctx.body = await handler(ctx, err);             
                    return;
                } catch (error) {
                    error.innerError = err;
                    err = error;
                }                   
            }             

            ctx.body = { error: err.expose ? err.message : http.STATUS_CODES[ctx.status] };
            ctx.app.emit('error', err, ctx);
        }        
    } 
};       