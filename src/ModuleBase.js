"use strict";

const path = require('path');
const Literal = require('./enum/Literal');
const { defaultBackendPath } = require('./utils/Helpers');

const ModuleBase = Base => class extends Base {
    /**     
     * @param {WebServer} server
     * @param {string} name - The name of the app module.
     * @param {string} route - The base route of the app module.
     * @param {string} appPath - The path to load the app's module files
     * @param {object} [options] - The app module's extra options defined in its parent's configuration.          
     * @property {bool} [options.logWithAppName=false] - Flag to include app name in log message.
     */
    constructor(server, name, appPath, options) {    
        super(name, Object.assign({
            workingPath: appPath, 
            configPath: path.join(appPath, Literal.DEFAULT_CONFIG_PATH)
        }, options));

        /**
         * Hosting server.
         * @member {WebServer}
         **/
        this.server = server;        

        /**
         * Whether it is a server.
         * @member {boolean}
         **/
        this.isServer = false;

        /**
         * Backend files path.
         * @member {string}         
         **/
        this.backendPath = this.toAbsolutePath(this.options.backendPath || defaultBackendPath); 
    }  

    /**
     * Get a service from module hierarchy     
     * @param name
     * @returns {object}
     */
    getService(name, currentModuleOnly) {
        return super.getService(name) || (!currentModuleOnly && this.server.getService(name));
    }    

    /**
     * Require a js module from backend path
     * @param {*} relativePath 
     */
    require(relativePath) {
        let modPath = path.join(this.backendPath, relativePath);
        return require(modPath);
    }

    /**
     * Require a module from the source path of a library module
     * @param {*} relativePath 
     */
    requireFromLib(appName, relativePath) {
        return this.server.requireFromLib(appName, relativePath);
    }

    /**
     * Default log method, may be override by loggers feature
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {...object} rest - Extra meta data
     * @returns {Routable}
     */
    log(level, message, ...rest) {
        if (this.options.logWithAppName) {
            message = '[' + this.name + '] ' + message;
        }

        if (this.logger) {
            this.logger.log(level, message, ...rest);
        } else {
            this.server.log(level, message, ...rest);
        }
        
        return this;
    }

    _getFeatureFallbackPath() {
        let pathArray = super._getFeatureFallbackPath();
        pathArray.splice(1, 0, path.resolve(__dirname, Literal.FEATURES_PATH));
        return pathArray;
    }
}

module.exports = ModuleBase;