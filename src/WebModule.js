"use strict";

const path = require('path');
const { _, text } = require('@genx/july');
const { ServiceContainer } = require('@genx/app');
const ModuleBase = require('./ModuleBase');
const Routable = require('./Routable');
const Literal = require('./enum/Literal');

/**
 * Web application module class.
 * @class
 * @extends Routable(LibModule)
 */
class WebModule extends ModuleBase(Routable(ServiceContainer)) {
    /**     
     * @param {WebServer} server
     * @param {string} name - The name of the app module.
     * @param {string} route - The base route of the app module.
     * @param {string} appPath - The path to load the app's module files
     * @param {object} [options] - The app module's extra options defined in its parent's configuration.          
     * @property {bool} [options.logWithAppName=false] - Flag to include app name in log message.
     */
    constructor(server, name, route, appPath, options) {    
        super(server, name, appPath, options);

        /**
         * Mounting route.
         * @member {string}
         */
        this.route = text.ensureStartsWith(text.dropIfEndsWith(route, '/'), '/');               
    }  

    /**
     * Require a module from the source path of an app module
     * @param {*} relativePath 
     */
    requireFromApp(appName, relativePath) {
        return this.server.requireFromApp(appName, relativePath);
    }

    _getFeatureFallbackPath() {
        let pathArray = super._getFeatureFallbackPath();
        pathArray.splice(2, 0, path.resolve(__dirname, Literal.APP_FEATURES_PATH));
        return pathArray;
    }
}

module.exports = WebModule;