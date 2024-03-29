"use strict";

/**
 * Enable middlewares
 * @module Feature_Middlewares
 */

const { Feature } = require('..').Enums;

module.exports = {

    /**
     * This feature is loaded at plugin stage
     * @member {string}
     */
    type: Feature.PLUGIN,

    /**
     * Load the feature
     * @param {Routable} app - The app module object
     * @param {*} middlewares - Middlewares and options
     * @returns {Promise.<*>}
     */
    load_: function (app, middlewares) {
        //delay to load middlewares after all plug-ins are ready
        app.useMiddlewares(app.router, middlewares);
        /*
        app.on('after:' + Feature.PLUGIN, () => {
            
        }); */       
    }
};