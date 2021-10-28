"use strict";

/**
 * Enable routing web requests to a child app.
 * @module Feature_AppRouting
 * 
 * @example
 *  
 *  'appRouting': {
 *      '<mounting point>': {
 *          name: 'app name', 
 *          npmModule: false, // whether is a npm module
 *          options: { // module options 
 *          },
 *          settings: { // can override module defined settings
 *          },
 *          middlewares: { // can override middlewares 
 *          }
 *      }
 *  } 
 */

const path = require('path');
const { _, eachAsync_ } = require('@genx/july');
const { fs } = require('@genx/sys');
const { InvalidConfiguration } = require('@genx/error');
const WebModule = require('../WebModule');
const Feature = require('@genx/app/lib/enum/Feature');

module.exports = {

    /**
     * This feature is loaded at plugin stage.
     * @member {string}
     */
    type: Feature.PLUGIN,

    /**
     * Load the feature.
     * @param {WebServer} server - The web server module object.
     * @param {object} routes - Routes and configuration.
     * @returns {Promise.<*>}
     */
    load_: async (server, routes) => eachAsync_(routes, async (config, baseRoute) => {
        if (!config.name) {
            throw new InvalidConfiguration(
                'Missing app name.',
                app,
                `appRouting.${baseRoute}.name`);
        }
    
        let options = Object.assign({ 
            env: server.env, 
            logWithAppName: server.options.logWithAppName,
            traceMiddlewares: server.options.traceMiddlewares
        }, config.options);

        let appPath;     

        if (config.npmModule) {
            appPath = server.toAbsolutePath('node_modules', config.name);
        } else {
            appPath = path.join(server.appModulesPath, config.name);
        }

        let exists = await fs.pathExists(appPath) && (await fs.stat(appPath)).isDirectory();
        if (!exists) {
            throw new InvalidConfiguration(
                `App [${config.name}] not exists.`,
                server,
                `appRouting.${baseRoute}.name`);
        }
    
        let app = new WebModule(server, config.name, baseRoute, appPath, options);
        app.now = server.now;
        app.__ = server.__;
        
        app.on('configLoaded', () => {
            if (!_.isEmpty(config.settings)) {
                app.config.settings = Object.assign({}, app.config.settings, config.settings);
                server.log('verbose', `App settings of [${app.name}] is overrided.`);
            }

            if (!_.isEmpty(config.middlewares)) {
                let middlewaresToAppend = app.config.middlewares;
                app.config.middlewares = { ...config.middlewares };
                _.defaults(app.config.middlewares, middlewaresToAppend);
            }
        });

        let relativePath = path.relative(server.workingPath, appPath);
        server.log('verbose', `Loading app [${app.name}] from "${relativePath}" ...`);
    
        await app.start_();
        
        server.log('verbose', `App [${app.name}] is loaded.`);

        //delayed the app routes mounting after all plugins of the server are loaded
        server.on('before:' + Feature.READY, () => {
            server.mountApp(app);
        });        
    })
};