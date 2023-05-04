"use strict";

require("source-map-support/register");
const {
  InvalidConfiguration,
  BadRequest
} = require('@genx/error');
const {
  requireFeatures
} = require('../utils/Helpers');
let serverPassport = (opt, app) => {
  let passportService = app.getService('passport');
  if (!passportService) {
    throw new InvalidConfiguration('Passport feature is not enabled.', app, 'passport');
  }
  return passportService.middlewares;
};
module.exports = serverPassport;
//# sourceMappingURL=serverPassport.js.map