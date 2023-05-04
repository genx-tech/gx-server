"use strict";

require("source-map-support/register");
const Literal = require('@genx/app/lib/enum/Literal');
module.exports = Object.assign({}, Literal, {
  APP_MODULES_PATH: 'app_modules',
  BACKEND_PATH: 'server',
  BACKEND_SRC_PATH: 'src',
  CLIENT_SRC_PATH: 'client',
  PUBLIC_PATH: 'public',
  MIDDLEWARES_PATH: 'middlewares',
  SERVER_CFG_NAME: 'server',
  SERVER_FEATURES_PATH: 'serverFeatures',
  APP_FEATURES_PATH: 'appFeatures',
  CONTROLLERS_PATH: 'controllers',
  RESOURCES_PATH: 'resources',
  VIEWS_PATH: 'views',
  LOCALE_PATH: 'locale',
  ALLOWED_HTTP_METHODS: new Set(['options', 'get', 'head', 'post', 'put', 'delete', 'trace', 'connect'])
});
//# sourceMappingURL=Literal.js.map