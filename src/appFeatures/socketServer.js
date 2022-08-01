"use strict";

/**
 * Socket based Rpc Server
 * @module Feature_SocketServer
 * 
 * middleware: (packet, next) => {}
 */

const path = require('path');
const { _, url: urlUtil, text } = require('@genx/july');
const { Feature } = require('..').Enums;
const { InvalidConfiguration } = require('@genx/error');

const DEFAULT_CONTROLLER_PATH = 'events';

function loadEventHandler(appModule, namespace, controllerBasePath, handlerName, isMiddleware = false) {
    let pos = handlerName.lastIndexOf('.');
    if (pos < 0) {
        if (isMiddleware) {
            throw new InvalidConfiguration(
                `Invalid middleware reference: ${handlerName}`,
                appModule,
                namespace ? `socketServer.routes["${namespace}"].middlewares` : 'socketServer.middlewares'
            );
        } else {
            throw new InvalidConfiguration(
                `Invalid event handler reference: ${handlerName}`,
                appModule,
                `socketServer.routes["${namespace}"].events`
            );
        }
    }

    let controller = handlerName.substr(0, pos);
    let action = handlerName.substr(pos + 1);

    let controllerPath = path.resolve(controllerBasePath, controller + '.js');
    let ctrl = require(controllerPath);
    
    let middlewareHandler = ctrl[action];
    if (typeof middlewareHandler !== 'function') {
        if (isMiddleware) {
            throw new InvalidConfiguration(
                `Middleware function not found: ${handlerName}`,
                appModule,
                namespace ? `socketServer.routes["${namespace}"].middlewares` : 'socketServer.middlewares'
            );
        } else {
            throw new InvalidConfiguration(
                `Event handler function not found: ${handlerName}`,
                appModule,
                `socketServer.routes["${namespace}"].events`
            );
        }
    }

    return middlewareHandler;
}

function startSocketServer(appModule, config) {
    const SocketServer = appModule.tryRequire('socket.io');

    let { port, logger, path: wsPath, ...options } = config;

    if (logger && typeof logger === 'string') {
        logger = appModule.getService('logger.' + logger);
    }

    function log(...args) {
        logger && logger.log(...args);
    }

    let io, standalone = false;

    let endpointPath = wsPath ? urlUtil.join(appModule.route, wsPath) : appModule.route;
    endpointPath = text.ensureStartsWith(endpointPath, '/');

    let serviceTag = port ? `socketServer:${port}${endpointPath}` : `socketServer:${endpointPath}`;

    if (appModule.hasService(serviceTag)) {
        throw new InvalidConfiguration(
            'Socket server path or port conflict.',
            appModule,
            `socketServer[${i}].(path|port)`
        );
    }            

    options.path = endpointPath;

    if (port) {
        io = new SocketServer(options);
        standalone = true;
        appModule.log('verbose', `A standalone socket server is listening at [port=${port}, path=${endpointPath}].`);        
    } else {
        io = new SocketServer(appModule.server.httpServer, options);
        port = appModule.server.port;
        appModule.log('verbose', `A socket server is listening at [path=${endpointPath}].`);        
    }

    io.on('connection', socket => {
        log('info', 'client connect', {
            endpoint: endpointPath,
            port,
            id: socket.id,
            ...socket.handshake
        });
    });

    let controllersPath = path.resolve(appModule.backendPath, config.controllersPath || DEFAULT_CONTROLLER_PATH);

    if (config.middlewares) {
        io.use(loadEventHandler(appModule, null, controllersPath, middlewareName, true));
    }

    if (_.isEmpty(config.routes)) {
        throw new InvalidConfiguration(
            'Missing routes config.',
            appModule,
            'socketServer.routes'
        );
    }        

    _.forOwn(config.routes, (info, name) => {
        name = text.ensureStartsWith(name, '/');

        let namespaceChannel = io.of(name);

        if (info.middlewares) {
            let m = Array.isArray(info.middlewares) ? info.middlewares : [ info.middlewares ];
            m.forEach(middlewareName => {
                namespaceChannel.use(loadEventHandler(appModule, name, controllersPath, middlewareName, true));
            });
        }

        let eventHandlers;

        if (info.controller) {                
            let rpcControllerPath = path.resolve(controllersPath, info.controller + '.js');
            eventHandlers = require(rpcControllerPath);

            appModule.log('verbose', `[${serviceTag}]Controller "${info.controller}" is attached for namespace "${name}".`);
        } 
        
        if (info.events) {
            eventHandlers = {};

            _.forOwn(info.events, (handler, event) => {
                eventHandlers[event] = loadEventHandler(appModule, name, controllersPath, handler);                    
            });

            appModule.log('verbose', `[${serviceTag}]Event handlers are attached for namespace "${name}".`, {
                events: Object.keys(eventHandlers)
            });
        }

        namespaceChannel.on('connect', function (socket) {
            let ctx = { appModule, socket };

            socket.on('disconnect', () => {
                log('verbose', 'namespace disconnect', { 
                    endpoint: endpointPath,
                    port,
                    id: socket.id, 
                    namespace: name 
                });

                if (info.onDisconnect) {
                    loadEventHandler(appModule, name, controllersPath, info.onDisconnect)(ctx).catch(error => log('error', error.message));            
                }     
            });

            log('verbose', 'namespace connect', { 
                endpoint: endpointPath,
                port,
                id: socket.id, 
                namespace: name 
            });           

            //Register event handlers
            eventHandlers && _.forOwn(eventHandlers, (handler, event) => {
                socket.on(event, (data, cb) => handler(ctx, data).then(cb));
            });                

            if (info.onConnect) {
                loadEventHandler(appModule, name, controllersPath, info.onConnect)(ctx).catch(error => log('error', error.message));            
            }            
        });
    });

    if (standalone) {
        io.listen(config.port);
    }

    appModule.registerService(serviceTag, io);

    return io;
}

module.exports = {

    /**
     * This feature is loaded at plugin stage
     * @member {string}
     */
    type: Feature.PLUGIN,

    /**
     * The socket server options.
     * @typedef {Object} ServerOptions
     * @property {string} [path=/socket.io] - name of the path to capture
     * @property {boolean} [serveClient=true] - whether to serve the client files
     * @property {Adapter} adapter - the adapter to use. Defaults to an instance of the Adapter that ships with socket.io which is memory based. See socket.io-adapter
     * @property {string} origins - the allowed origins
     * @property {Parser} parser - the parser to use. Defaults to an instance of the Parser that ships with socket.io. See socket.io-parser
     * @see {@link https://socket.io/docs/server-api/} for more options
     */

    /**
     * Load the rpc Server
     * @param {AppModule} appModule - The app module object
     * @param {ServerOptions[]} servers - Rpc server config
     */
    load_: (appModule, servers) => {        

        if (Array.isArray(servers)) {
            return servers.forEach(server => startSocketServer(appModule, server));            
        }

        let io = startSocketServer(appModule, servers);

        //default socket server
        appModule.registerService('socketServer', io);
    }
};