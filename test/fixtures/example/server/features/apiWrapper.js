"use strict";

require("source-map-support/register");

const {
  Feature,
  Helpers: {
    ensureFeatureName
  }
} = require('@genx/app');

const http = require('http');

const statusToError = {
  400: 'invalid_request',
  401: 'unauthenticated',
  403: 'permission_denied',
  404: 'resource_not_found'
};
const unknownError = 'unknown_error';
module.exports = {
  type: Feature.SERVICE,
  groupable: true,
  load_: async function (app, settings, name) {
    ensureFeatureName(name);
    const service = {
      wrapResult: (ctx, result = null, others) => {
        return {
          status: 'success',
          ...others,
          result
        };
      },
      wrapError: (ctx, error, others) => {
        const code = error.code || statusToError[ctx.status] || unknownError;
        console.log(error);
        return {
          status: 'error',
          ...others,
          error: {
            code,
            message: error.expose ? error.message : http.STATUS_CODES[ctx.status]
          }
        };
      }
    };
    app.registerService(name, service);
  }
};
//# sourceMappingURL=apiWrapper.js.map