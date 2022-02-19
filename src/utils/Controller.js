const {  } = require('@genx/error');

class Controller {
    constructor(app) {
        this.app = app;
        this.apiWrapper = this.app.getService(this.app.settings.apiWrapperService || 'apiWrapper');

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
