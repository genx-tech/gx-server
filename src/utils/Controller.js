const { } = require('@genx/error');

class Controller {
    constructor(ctx) {
        this.ctx = ctx;

        this.app = this.ctx.appModule;

        this.config = this.app.server.config;

        this.apiWrapper = this.app.getService(this.config.settings.apiWrapperService || 'apiWrapper');

        if (!this.apiWrapper) {
            throw new ApplicationError('"apiWrapper" service is required when using the Controller helper.');
        }
    }

    db(name) {
        return this.app.db(name || this.app.settings.db);
    }

    tryTtlCache(key) {
        if (this.ctx.query['no-cache']) {
            return false;
        }

        const ttlCache = this.app.getService('ttlMemCache');
        if (!ttlCache) {
            throw new ApplicationError('"ttlMemCache" service is required. Please check npm module "@genx/app-feat-commons".');
        }

        const _cache = ttlCache.get(key);
        if (_cache) {
            this.send(this.ctx, ..._cache);
            return true;
        }
        return false;
    }

    send(result, payload, ttlCacheInfo) {
        this.ctx.body = this.apiWrapper.wrapResult(this.ctx, result, payload);
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
