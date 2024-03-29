"use strict";

require("source-map-support/register");
const {
  InvalidConfiguration
} = require('@genx/error');
let createMiddleware = (opt, app) => {
  if (!opt || !opt.strategy) {
    throw new InvalidConfiguration('Missing strategy name.', app, 'middlewares.passportAuth.strategy');
  }
  let passportService = app.getService('passport');
  if (!passportService) {
    throw new InvalidConfiguration('Passport feature is not enabled.', app, 'passport');
  }
  return passportService.authenticate(opt.strategy, opt.options);
};
module.exports = createMiddleware;
//# sourceMappingURL=passportAuth.js.map