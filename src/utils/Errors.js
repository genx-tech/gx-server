"use strict";

/**
 * Error definitions.
 * @module Errors
 */

const { withStatus } = require('./Helpers');
const { Errors: { RequestError, ApplicationError } } = require('@genx/app');
const HttpCode = require('http-status-codes');

/**
 * Http BadRequest, 400.
 * @class 
 * @extends RequestError
 * @mixes withStatus
 */
class BadRequest extends withStatus(RequestError, HttpCode.BAD_REQUEST) {        
};

/**
 * Http NotFound, 404.
 * @class 
 * @extends RequestError
 * @mixes withStatus
 */
class NotFound extends withStatus(RequestError, HttpCode.NOT_FOUND) {

};

/**
 * Http MethodNotAllowed, 405.
 * @class 
 * @extends RequestError
 * @mixes withStatus
 */
class MethodNotAllowed extends withStatus(RequestError, HttpCode.METHOD_NOT_ALLOWED) {

};

/**
 * Error caused by all kinds of runtime errors.
 * @class
 * @extends ApplicationError 
 * @mixes withStatus
 */
class ServerError extends withStatus(ApplicationError, HttpCode.INTERNAL_SERVER_ERROR) {
};

/**
 * Error caused by invalid configuration.
 * @class
 * @extends ServerError  
 */
class InvalidConfiguration extends ServerError {
    /**
     * @param {string} message - Error message
     * @param {App} [app] - The related app module
     * @param {string} [item] - The related config item   
     */ 
    constructor(message, app, item) {        
        super(message, 'E_INVALID_CONFIG', { app: app.name, configNode: item });
    }
}

exports.BadRequest = BadRequest;
exports.NotFound = NotFound;
exports.MethodNotAllowed = MethodNotAllowed;
exports.ServerError = ServerError;
exports.InvalidConfiguration = InvalidConfiguration;