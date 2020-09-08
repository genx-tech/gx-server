"use strict";

const path = require('path');
const { _, fs, eachAsync_, urlJoin, getValueByPath } = require('rk-utils');
const Router = require('@koa/router');
const HttpCode = require('http-status-codes');
const { Helpers: { tryRequire } } = require('@genx/app');
const { InvalidConfiguration, BadRequest, NotFound } = require('../utils/Errors');
const Koa = require('koa');
const mount = require('koa-mount');

/**
 * GraphQL router.
 * @module Router_GraphQL
 */

/**
 * Create a GraphQL router.
 * @param {*} app 
 * @param {string} baseRoute 
 * @param {objects} options 
 * @property {string} options.schema
 * @property {object|array} [options.middlewares]
 * @property {boolean} [options.graphiql]
 * @example
 *  '<base path>': {
 *      graphql: {          
 *          middlewares: {},
 *          schema: 'graphql/schema',
 *          rootValue: '',
 *          graphiql: true
 *      }
 *  }
 */
module.exports = async (app, baseRoute, options) => {
    const graphqlHTTP = tryRequire('koa-graphql');        

    const { middlewares, schemaProvider, ...graphqlOpts } = options;

    if (!schemaProvider) {
        throw new InvalidConfiguration(
            'Missing schemaProvider config.',
            app,
            `routing.${baseRoute}.graphql.schemaProvider`
        );
    }

    const schemaFactory = require(path.resolve(app.backendPath, schemaProvider));
    const schemaObj = await schemaFactory(app);

    if (!schemaObj.schema) {
        throw new InvalidConfiguration(
            'The object returned from schemaProvider doesnot contain the schema body.',
            app,
            `routing.${baseRoute}.graphql.schemaProvider`
        );
    }
 
    graphqlOpts.schema = schemaObj.schema;
    if (schemaObj.rootValue) {
        graphqlOpts.rootValue = schemaObj.rootValue;
    }
    
    let router = new Koa();

    if (middlewares) {
        app.useMiddlewares(router, middlewares);
    }

    router.use(mount('/', graphqlHTTP(graphqlOpts)));
    app.mountRouter(baseRoute, router);
};