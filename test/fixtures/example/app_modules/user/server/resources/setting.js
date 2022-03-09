const Controller = require('../../../../../../../lib/utils/Controller');

module.exports = class extends Controller {

    async find() {
        this.send({ status: "success", data: this.config.settings, method: "find()" });
    }
}