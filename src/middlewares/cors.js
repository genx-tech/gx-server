"use strict";

/**
 * Cross-Origin Resource Sharing(CORS) middleware.
 * @module Middleware_Cors
 */

/**
 * @function
 * @param {Object} options
 * @property {String|Function(ctx)} [options.origin] - `Access-Control-Allow-Origin`, default is request Origin header
 * @property {String|Array} [options.allowMethods] - `Access-Control-Allow-Methods`, default is 'GET,HEAD,PUT,POST,DELETE,PATCH'
 * @property {String|Array} [options.exposeHeaders] - `Access-Control-Expose-Headers`
 * @property {String|Array} [options.allowHeaders] - `Access-Control-Allow-Headers`
 * @property {String|Number} [options.maxAge] - `Access-Control-Max-Age` in seconds
 * @property {Boolean} [options.credentials] - `Access-Control-Allow-Credentials`
 * @property {Boolean} [options.keepHeadersOnError] - Add set headers to `err.header` if an error is thrown
 */
const cors = require('@koa/cors');

module.exports = cors;
