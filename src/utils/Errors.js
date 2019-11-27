"use strict";

/**
 * Error definitions.
 * @module Errors
 */

const { withStatus } = require('./Helpers');
const { Errors: { RequestError, ApplicationError, InvalidConfiguration } } = require('@genx/app');
const HttpCode = require('http-status-codes');

/**
 * Http NotFound, 404.
 * @class 
 * @extends RequestError
 * @mixes withStatus
 */
const NotFound = withStatus(RequestError, HttpCode.NOT_FOUND);

/**
 * Http MethodNotAllowed, 405.
 * @class 
 * @extends RequestError
 * @mixes withStatus
 */
const MethodNotAllowed = withStatus(RequestError, HttpCode.METHOD_NOT_ALLOWED);

/**
 * Service unavailable error.
 * @class
 * @extends ApplicationError 
 * @mixes withStatus
 */
const ServiceUnavailable = withStatus(ApplicationError, HttpCode.SERVICE_UNAVAILABLE);

exports.InvalidConfiguration = InvalidConfiguration;
exports.BadRequest = RequestError;
exports.NotFound = NotFound;
exports.MethodNotAllowed = MethodNotAllowed;
exports.ServerError = ApplicationError;
exports.ServiceUnavailable = ServiceUnavailable;