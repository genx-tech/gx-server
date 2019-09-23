"use strict";

const { InvalidConfiguration, BadRequest } = require('../utils/Errors');

/**
 * Passport initialization middleware, required to initialize Passport service.
 * @module Middleware_PassportAuth
 */

/**
 * Create a passport authentication middleware.
 * @param {object} opt - Passport options
 * @property {string} opt.strategy - Passport strategy
 * @property {object} [opt.options] - Passport strategy options
 * @property {object} [opt.customHandler] - Flag to use passport strategy customHandler 
 * @param {Routable} app
 * @returns {KoaActionFunction}
 */
let createMiddleware = (opt, app) => {
    if (!opt || !opt.strategy) {
        throw new InvalidConfiguration(
            'Missing strategy name.', 
            app, 
            'middlewares.passportAuth.strategy'
        );
    }    
    
    let passportService = app.getService('passport');

    if (!passportService) {
        throw new InvalidConfiguration(
            'Passport feature is not enabled.',
            app,
            'passport'
        );
    }

    if (opt.customHandler) {
        return (ctx, next) => passportService.authenticate(opt.strategy, opt.options, (err, user, info) => {
                if (err) {
                    throw err;
                }

                if (!user) {
                    if (info instanceof Error) {
                        throw info;
                    }                    

                    throw new BadRequest(info || `Invalid credential.`);
                }

                return ctx.login(user, (opt && opt.options) || { session: false }).then(next);
        })(ctx, next);
    }
    
    return passportService.authenticate(opt.strategy, opt.options);
};

module.exports = createMiddleware;