"use strict";
require("source-map-support/register");
const path = require('path');
const Literal = require('../enum/Literal');
const {
  InvalidConfiguration
} = require('@genx/error');
const koaError = require('koa-error');
module.exports = (options, app) => {
  if (!options.template) {
    if (options.engine && options.engine !== 'swig') {
      throw new InvalidConfiguration('Missing template option.', app, 'middlewares.templatedError.template');
    }
    options.template = 'defaultError.swig';
  }
  options.template = path.resolve(app.backendPath, Literal.VIEWS_PATH, options.template);
  if (!options.engine) {
    options.engine = 'swig';
  }
  return koaError(options);
};
//# sourceMappingURL=templatedError.js.map