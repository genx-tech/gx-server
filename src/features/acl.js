"use strict";

/**
 * Enable acl feature
 * @module Feature_Acl
 */

const path = require('path');
const { _, eachAsync_ } = require('rk-utils');
const { Feature } = require('..').enum;
const { tryRequire } = require('@genx/app/lib/utils/Helpers');
const Acl = tryRequire('acl');
const { InvalidConfiguration } = require('../utils/Errors');

module.exports = {

    /**
     * This feature is loaded at service stage
     * @member {string}
     */
    type: Feature.PLUGIN,

    /**
     * Load the feature
     * @param {Routable} app - The app module object
     * @param {object} config - Acl settings
     * @property {string} config.backend - Backend store type of acl, memory, mongodb, redis
     * @property {string} [config.dataSource] - Store type of acl
     * @property {object} [config.prefix] - Store options
     * @returns {Promise.<*>}
     * 
     * @example
     * 
     * acl: {
     *   backend: 'mongodb.dataSourceName'
     * }
     */
    load_: async function (app, config) {
        let backend = config.backend || 'memory';
        let backendType, backendStore;

        if (backend.indexOf('.') > 0) {
            backendType = '';
        }

        switch (backend) {
            case 'memory':
            backendStore = new Acl.memoryBackend();
            break;

            case 'mongodb':
            if (!config.dataSource) {
                throw new InvalidConfiguration('"dataSource" is required for mongodb backend of acl.', app, 'acl.dataSource');
            }

            let mongodb = app.getService(config.dataSource);
            if (!mongodb) {
                throw new InvalidConfiguration(`Data source "${config.dataSource}" not found.`, app, 'acl.dataSource');
            }

            backendStore = new Acl.mongodbBackend(await mongodb.connect_(), config.prefix);
            break;

            case 'redis':
            throw new Error('to be implemented');
            break;

            default:
            throw new InvalidConfiguration('Unsupported acl backend: ' + backend, app, 'acl.backend');
        }        
    
        app.acl = new Acl(backendStore);       
    }
};