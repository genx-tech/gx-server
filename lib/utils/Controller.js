"use strict";

require("source-map-support/register");
const {
  ApplicationError
} = require('@genx/error');
class Controller {
  constructor(app) {
    var _this$app$settings;
    this.app = app;
    this.apiWrapper = this.app.getService(((_this$app$settings = this.app.settings) === null || _this$app$settings === void 0 ? void 0 : _this$app$settings.apiWrapperService) || 'apiWrapper');
    if (!this.apiWrapper) {
      throw new ApplicationError('"apiWrapper" service is required when using the Controller helper.');
    }
  }
  db(name) {
    return this.app.db(name || this.app.settings.db);
  }
  tryTtlCache(ctx, key) {
    if (ctx.query['no-cache']) {
      return false;
    }
    const ttlCache = this.app.getService('ttlMemCache');
    if (!ttlCache) {
      throw new ApplicationError('"ttlMemCache" service is required. Please check npm module "@genx/app-feat-commons".');
    }
    const _cache = ttlCache.get(key);
    if (_cache) {
      this.send(ctx, ..._cache);
      return true;
    }
    return false;
  }
  deleteTtlCache(key) {
    const ttlCache = this.app.getService('ttlMemCache');
    ttlCache.del(key);
  }
  send(ctx, result, payload, ttlCacheInfo) {
    ctx.body = this.apiWrapper.wrapResult(ctx, result, payload);
    if (ttlCacheInfo) {
      const ttlCache = this.app.getService('ttlMemCache');
      const value = [result];
      if (payload) {
        value.push(payload);
      }
      ttlCache.set(ttlCacheInfo.key, [result, payload], ttlCacheInfo.ttl);
    }
  }
  cache(key, factory) {
    if (!this._cache) {
      this._cache = {};
    }
    let value = this._cache[key];
    if (value == null) {
      value = this._cache[key] = factory();
    }
    return value;
  }
}
module.exports = Controller;
//# sourceMappingURL=Controller.js.map