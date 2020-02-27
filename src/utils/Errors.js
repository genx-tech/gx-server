"use strict";

/**
 * Error definitions.
 * @module Errors
 */

const { 
    Errors: { GeneralError, ApplicationError, InvalidArgument, InvalidConfiguration, ExposableError }
} = require('@genx/app');

const HttpCode = require('http-status-codes');

/**
 * Request errors.
 * @class
 * @extends ExposableError  
 */
class BadRequest extends ExposableError {
    constructor(message, info) {
        super(message, info, HttpCode.BAD_REQUEST, 'E_BAD_REQ');
    }
}  
   
/**
 * Http NotFound, 404.
 * @class 
 * @extends ExposableError
 */
class NotFound extends ExposableError {
    constructor(message, info) {
        super(message, info, HttpCode.NOT_FOUND, 'E_NOT_FOUND');
    }
}  

/**
 * Http Unauthorized, 401.
 * @class 
 * @extends ExposableError
 */
class Unauthorized extends ExposableError {
    constructor(message, info) {
        super(message, info, HttpCode.UNAUTHORIZED, 'E_UNAUTHORIZED');
    } 
} 

/**
 * Service unavailable error, 503
 * @class
 * @extends GeneralError  
 */
class ServiceUnavailable extends GeneralError {
    constructor(message, info) {
        super(message, info, HttpCode.SERVICE_UNAVAILABLE, 'E_UNAVAILABLE');
    }
}

exports.InvalidArgument = InvalidArgument;
exports.InvalidConfiguration = InvalidConfiguration;
exports.BadRequest = BadRequest;
exports.NotFound = NotFound;
exports.Unauthorized = Unauthorized;
exports.ServerError = ApplicationError;
exports.ServiceUnavailable = ServiceUnavailable;