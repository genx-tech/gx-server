"use strict";

const Feature = require('@genx/app/lib/enum/Feature');
const Util = require('rk-utils');
const _ = Util._;
const Promise = Util.Promise;
const validator = require('validator');
const { InvalidConfiguration } = require('../utils/Errors');

/**
 * Koa middleware function
 * @callback KoaActionFunction
 * @async
 * @param {object} ctx - The koa request and response context. [See koajs about ctx details]{@link http://koajs.com/#context}
 * @property {object} ctx.reqeust - The koa request object.
 * @property {object} ctx.response - The koa response object.
 * @param {KoaActionFunction} [next] - Next middleware or action.
 */

/**
 * Enable koa-based web engine.
 * @module Feature_Koa 
 */

module.exports = {

    /**
     * This feature is loaded at service stage
     * @member {string}
     */
    type: Feature.SERVICE,

    /**
     * Load the feature
     * @param {WebServer} server - The web server
     * @param {object} options - Options for the feature     
     * @property {bool} [options.trustProxy] - When true proxy header fields will be trusted
     * @property {Array.<string>} [options.keys] - Set signed cookie keys
     * @property {int} [options.httpPort] - The http port number
     * @property {int} [options.subdomainOffset=2] - The offset of subdomains to ignore, default: 2
     * @returns {Promise.<*>}
     */
    load_: function (server, options) {
        let koa = server.router;
        server.koa = koa;
        
        koa.env = server.env;
        koa.proxy = options.trustProxy && validator.toBoolean(options.trustProxy);

        if (('subdomainOffset' in options) && options.subdomainOffset !== 2) {
            if (options.subdomainOffset < 2) {
                throw new InvalidConfiguration(
                    'Invalid subdomainOffset. Should be larger or equal to 2.',
                    appModule,
                    'koa.subdomainOffset'
                );
            }

            koa.subdomainOffset = options.subdomainOffset;
        }

        if (options.keys) {
            if (!_.isArray(options.keys)) {
                koa.keys = [ options.keys ];
            } else {
                koa.keys = options.keys;
            }
        }

        koa.on('error', (err, ctx) => {
            let extra = _.pick(err, [ 'status', 'code', 'info' ]);

            if (ctx) {
                extra.request = _.pick(ctx, ['method', 'url', 'ip']);
            }

            if (err.status && err.status < 500) {             
                if (server.env === 'development') {
                    extra.stack = err.stack;
                }   
                server.log('warn', `[${err.status}] ` + err.message, extra);
                return;
            } 
            
            server.logError(error);
        });                
        
        server.httpServer = require('http').createServer(koa.callback());                

        let port = options.httpPort || 2331;

        server.on('ready', () => {
            server.httpServer.listen(port, function (err) {
                if (err) throw err;

                let address = server.httpServer.address();

                let host;
                if (address.family === 'IPv6' && address.address === '::') {
                    host = '127.0.0.1';
                } else {
                    host = address.address;
                }

                server.host = `${host}:${address.port}`;

                server.log('info', `A http service is listening on port [${address.port}] ...`);
                /**
                 * Http server ready event
                 * @event WebServer#httpReady
                 */
                server.emit('httpReady');
            });
        });
    }
};