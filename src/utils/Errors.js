"use strict";

/**
 * Error definitions.
 * @module Errors
 */

const { Errors: { GeneralError, ApplicationError, InvalidArgument, InvalidConfiguration }, Helpers: { withProps, withArgFill } } = require('@genx/app');
const HttpCode = require('http-status-codes');

const ExposableError = withProps(GeneralError, { expose: true });

/**
 * Request errors.
 * @class
 * @extends GeneralError  
 * @mixes withArgFill
 */
const BadRequest = withArgFill(ExposableError, 2, HttpCode.BAD_REQUEST, 'E_BAD_REQ');
   
/**
 * Http NotFound, 404.
 * @class 
 * @extends RequestError
 * @mixes withArgFill
 */
const NotFound = withArgFill(ExposableError, 2, HttpCode.NOT_FOUND, 'E_NOT_FOUND');

/**
 * Http MethodNotAllowed, 405.
 * @class 
 * @extends RequestError
 * @mixes withArgFill
 */
const MethodNotAllowed = withArgFill(ExposableError, 2, HttpCode.METHOD_NOT_ALLOWED, 'E_METHOD_NOT_ALLOWED');

/**
 * Service unavailable error.
 * @class
 * @extends ApplicationError 
 * @mixes withArgFill
 */
const ServiceUnavailable = withArgFill(GeneralError, 2, HttpCode.SERVICE_UNAVAILABLE, 'E_UNAVAILABLE');

exports.InvalidArgument = InvalidArgument;
exports.InvalidConfiguration = InvalidConfiguration;
exports.BadRequest = BadRequest;
exports.NotFound = NotFound;
exports.MethodNotAllowed = MethodNotAllowed;
exports.ServerError = ApplicationError;
exports.ServiceUnavailable = ServiceUnavailable;