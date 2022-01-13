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

    send(ctx, result, payload) {
        ctx.body = this.apiWrapper.wrapResult(ctx, result, payload);
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
