const {
    Helpers: { Controller },
} = require("../../../../../..");

const { Types } = require("@genx/data");

module.exports = class extends Controller {
    async find(ctx) {
        const query = Types.OBJECT.sanitize(ctx.query, {
            schema: {
                date: { type: "datetime", optional: true },
            },
        });

        this.send(ctx, [
            {
                text: "Hi",
            },
            {
                text: "There",
            },
            { query },
        ]);
    }

    async findById(ctx, name) {
        this.send(ctx, {
            text: `Hello ${name}`,
        });
    }
};
