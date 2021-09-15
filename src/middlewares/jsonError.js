"use strict";

/**
 * Error response middleware with json
 * @module Middleware_JsonError
 */

const http = require('http');

module.exports = (opt, app) => { 
    let handler;

    if (opt && opt.customHandler) {
        handler = app.getBackendAction(opt.customHandler);
    }

    return async (ctx, next) => {
        try {
            await next();

            if (ctx.errorHandled) {
                return;
            }

            if (ctx.status >= 400) {
                if (ctx.type === 'text/plain') {
                    ctx.throw(ctx.status, ctx.body);
                } else {
                    ctx.throw(ctx.status);
                }  
            }
        } catch (err) {        
            ctx.status = typeof err.status === 'number' && err.status >= 100 ? err.status : 500;               
            ctx.type = 'application/json';

            // accepted types
            if (handler) {      
                try {                    
                    ctx.body = await handler(ctx, err);     
                    ctx.app.emit('error', err, ctx);  
                    ctx.errorHandled = true;      
                    return;
                } catch (error) {
                    error.innerError = err;
                    err = error;
                }                   
            }             

            ctx.body = { error: (err.expose && err.message) ? err.message : http.STATUS_CODES[ctx.status] };
            ctx.app.emit('error', err, ctx);
        }        
    } 
};       