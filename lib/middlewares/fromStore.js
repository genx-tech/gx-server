"use strict";

require("source-map-support/register");

const {
  requireFeatures
} = require('../utils/Helpers');

module.exports = (name, app) => {
  requireFeatures(['objectStore'], app, 'fromStore');
  return app.store.ensureOne(name);
};
//# sourceMappingURL=fromStore.js.map