const Controller = require('../../../../../../../lib/utils/Controller');

module.exports = class extends Controller {

    async post() {
        this.send({ status: 'success', data: this.ctx.request.body, method: 'post' });
    }

    async find() {
        this.send({ status: "success", query: this.ctx.query, method: "find()" });
    }

    async updateById(id) {
        this.send({ status: 'success', param: id, body: this.ctx.request.body, method: 'updateById' });
    }

    async findById(id) {
        this.send({ status: 'success', param: id, method: 'findById' });
    }

    async deleteById(id) {
        this.send({ status: 'success', param: id, method: 'deleteById' });
    }
}