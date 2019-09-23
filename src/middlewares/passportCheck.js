"use strict";

/**
 * Middleware to check user logged in status based on passport
 * @module Middleware_PassportCheck
 */

const HttpCode = require('http-status-codes');

/**
 * Initialize ensureLoggedIn middleware
 * @param {object} options
 * @property {string} [options.loginUrl] - If given, will redirect to loginUrl if not loggedIn
 * @property {boolean} [options.successReturnToOrRedirect] - If given, will redirect to loginUrl if not loggedIn 
 * @param {Routable} app
 */  
module.exports = (options, app) => {
    return async (ctx, next) => {
        if (ctx.isAuthenticated()) {
            return next();
        }

        if (options.successReturnToOrRedirect && ctx.session) {
            ctx.session.returnTo = ctx.originalUrl || ctx.url;            
        }

        if (!options.loginUrl) {
            ctx.throw(HttpCode.UNAUTHORIZED, 'authentication required');
        }

        return ctx.redirect(options.loginUrl);
    }
};