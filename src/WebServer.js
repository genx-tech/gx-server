"use strict";

const path = require('path');
const { _, eachAsync_ } = require('rk-utils');
const { Runable, ServiceContainer } = require('@genx/app');
const Routable = require('./Routable');
const Literal = require('./enum/Literal');
const { defaultBackendPath } = require('./utils/Helpers');
const mount = require('koa-mount');

/**
 * Web server class.
 * @class
 * @extends Routable(App)
 */
class WebServer extends Routable(Runable(ServiceContainer)) {
    /**          
     * @param {string} [name='server'] - The name of the server.     
     * @param {object} [options] - The app module's extra options defined in its parent's configuration.
     * @property {object} [options.logger] - Logger options
     * @property {bool} [options.verbose=false] - Flag to output trivial information for diagnostics
     * @property {string} [options.env] - Environment, default to process.env.NODE_ENV
     * @property {string} [options.workingPath] - App's working path, default to process.cwd()
     * @property {string} [options.configPath] - App's config path, default to "conf" under workingPath   
     * @property {string} [options.configName] - App's config basename, default to "app"
     * @property {string} [options.backendPath='server'] - Relative path of back-end server source files
     * @property {string} [options.clientPath='client'] - Relative path of front-end client source files     
     * @property {string} [options.publicPath='public'] - Relative path of front-end static files    
     * @property {string} [options.appModulesPath=app_modules] - Relative path of child modules                    
     */
    constructor(name, options) {
        if (typeof options === 'undefined' && _.isPlainObject(name)) {
            options = name;
            name = undefined;
        }        

        super(name || 'server', Object.assign({ configName: Literal.SERVER_CFG_NAME }, options));    

        /**
         * Hosting server.
         * @member {WebServer}
         **/
        this.server = this;

        /**
         * Whether it is a server.
         * @member {boolean}
         **/
        this.isServer = true;

        /**
         * Backend files path.
         * @member {string}         
         **/
        this.backendPath = this.toAbsolutePath(this.options.backendPath || defaultBackendPath); 

        /**
         * App modules path.
         * @member {string}
         */
        this.appModulesPath = this.toAbsolutePath(this.options.appModulesPath || Literal.APP_MODULES_PATH);

        /**
         * Base route.
         * @member {string}
         */
        this.route = "/";
        
        this.on('configLoaded', () => {
            // load builtin middlewares
            this.loadMiddlewaresFrom(path.resolve(__dirname, Literal.MIDDLEWARES_PATH));
        });        
    }

    async stop_() {
        if (this.started) {
            if (this.appModules) {
                await eachAsync_(this.appModules, app => app.stop_());
                delete this.appModules;
                delete this.appModulesByAlias;
            }       
            
            if (this.libModules) {
                await eachAsync_(this.libModules, lib => lib.stop_());
                delete this.libModules;
            }
        }

        if (this.httpServer) {
            await new Promise((resolve, reject) => {
                this.httpServer.close((err) => {
                    if (err) return reject(err);                                   
                    resolve();                    
                });
            });            

            delete this.httpServer;
            this.log('info', `The http service is stopped.`); 
        }

        return super.stop_();
    }

    /**
     * Mount an app at specified route.
     * @param {WebModule} app 
     */
    mountApp(app) {
        if (!this.appModules) {
            this.appModules = {};
            this.appModulesByAlias = {};
        }

        assert: !this.appModules.hasOwnProperty(app.route);

        this.router.use(mount(app.route, app.router));
        this.appModules[app.route] = app;

        if (app.name in this.appModulesByAlias) {
            let existingApp = this.appModulesByAlias[app.name];
            //move bucket
            this.appModulesByAlias[`${existingApp.name}[@${existingApp.route}]`] = existingApp;
            delete this.appModulesByAlias[app.name];

            this.appModulesByAlias[`${app.name}[@${app.route}]`] = app;
        } else {
            this.appModulesByAlias[app.name] = app;
        }

        this.log('verbose', `All routes from app [${app.name}] are mounted under "${app.route}".`);
    }

    /**
     * Register a loaded lib module
     * @param {LibModule} lib 
     */
    registerLib(lib) {
        if (!this.libModules) {
            this.libModules = {};
        }

        this.libModules[lib.name] = lib;
    }

    /**
     * Get the app module object by base route
     * @param {string} p - App module base route started with "/"
     */
    getAppByRoute(p) {
        return this.appModules[p];
    }

    /**
     * Get the app module object by app alias, usually the app name if no duplicate entry
     * @param {string} a - App module alias
     */
    getAppByAlias(a) {
        return this.appModulesByAlias[a];
    }

    /**
     * Get the lib module
     * @param {string} libName 
     */
    getLib(libName) {
        if (!this.libModules) {
            throw new Error('"libModules" feature is required to access lib among modules.');
        }

        let libModule = this.libModules[libName];
        
        if (!libModule) {
            throw new Error(`Lib module [${libName}] not found.`);
        }

        return libModule;
    }

    /**
     * Require a module from the source path of a library module
     * @param {*} relativePath 
     */
    requireFromLib(libName, relativePath) {
        let libModule = this.getLib(libName);
        return libModule.require(relativePath);
    }

    /**
     * Get a registered service
     * @param {string} name 
     */
    getService(name) {
        let pos = name.indexOf(':');
        if (pos === -1) {
            return super.getService(name);
        }

        let modAlias = name.substr(0, pos);
        name = name.substr(pos+1);

        let app = this.getAppByAlias(modAlias);
        return app && app.getService(name, true);
    }

    _getFeatureFallbackPath() {
        let pathArray = super._getFeatureFallbackPath();
        pathArray.splice(1, 0, path.resolve(__dirname, Literal.FEATURES_PATH), path.resolve(__dirname, Literal.APP_FEATURES_PATH), path.resolve(__dirname, Literal.SERVER_FEATURES_PATH));
        return pathArray;
    }
}

module.exports = WebServer;