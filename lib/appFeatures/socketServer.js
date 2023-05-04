"use strict";
require("source-map-support/register");
const path = require('path');
const {
  _,
  url: urlUtil,
  text
} = require('@genx/july');
const {
  Feature,
  Helpers: {
    ensureFeatureName
  }
} = require("@genx/app");
const {
  InvalidConfiguration
} = require('@genx/error');
const DEFAULT_CONTROLLER_PATH = 'events';
function loadEventHandler(appModule, namespace, controllerBasePath, handlerName, isMiddleware = false) {
  let pos = handlerName.lastIndexOf('.');
  if (pos < 0) {
    if (isMiddleware) {
      throw new InvalidConfiguration(`Invalid middleware reference: ${handlerName}`, appModule, namespace ? `socketServer.routes["${namespace}"].middlewares` : 'socketServer.middlewares');
    } else {
      throw new InvalidConfiguration(`Invalid event handler reference: ${handlerName}`, appModule, `socketServer.routes["${namespace}"].events`);
    }
  }
  let controller = handlerName.substring(0, pos);
  let action = handlerName.substring(pos + 1);
  let controllerPath = path.resolve(controllerBasePath, controller + '.js');
  let ctrl = require(controllerPath);
  let middlewareHandler = ctrl[action];
  if (typeof middlewareHandler !== 'function') {
    if (isMiddleware) {
      throw new InvalidConfiguration(`Middleware function not found: ${handlerName}`, appModule, namespace ? `socketServer.routes["${namespace}"].middlewares` : 'socketServer.middlewares');
    } else {
      throw new InvalidConfiguration(`Event handler function not found: ${handlerName}`, appModule, `socketServer.routes["${namespace}"].events`);
    }
  }
  return middlewareHandler;
}
function startSocketServer(appModule, serviceName, config) {
  const ioServer = appModule.tryRequire('socket.io');
  let {
    port,
    logger,
    path: wsPath,
    ...options
  } = config;
  if (logger && typeof logger === 'string') {
    logger = appModule.getService('logger.' + logger);
  }
  function log(...args) {
    logger && logger.log(...args);
  }
  function logError(error) {
    logger && logger.log('error', error.message || error);
  }
  let io,
    standalone = false;
  let endpointPath = wsPath ? urlUtil.join(appModule.route, wsPath) : appModule.route;
  endpointPath = text.ensureStartsWith(endpointPath, '/');
  options.path = endpointPath;
  if (port) {
    io = ioServer(options);
    standalone = true;
    appModule.log('verbose', `A standalone socket server is listening at [port=${port}, path=${endpointPath}].`);
  } else {
    io = ioServer(appModule.server.httpServer, options);
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
    socket.on('disconnect', () => {
      log('info', 'client disconnect', {
        endpoint: endpointPath,
        port,
        id: socket.id
      });
    });
  });
  let controllersPath = path.resolve(appModule.backendPath, config.controllersPath || DEFAULT_CONTROLLER_PATH);
  if (config.middlewares) {
    io.use(loadEventHandler(appModule, null, controllersPath, middlewareName, true));
  }
  if (_.isEmpty(config.routes)) {
    throw new InvalidConfiguration('Missing routes config.', appModule, 'socketServer.routes');
  }
  _.forOwn(config.routes, (info, name) => {
    name = text.ensureStartsWith(name, '/');
    let namespaceChannel = io.of(name);
    if (info.middlewares) {
      let m = Array.isArray(info.middlewares) ? info.middlewares : [info.middlewares];
      m.forEach(middlewareName => {
        namespaceChannel.use(loadEventHandler(appModule, name, controllersPath, middlewareName, true));
      });
    }
    let eventHandlers;
    if (!info.controller) {
      throw new InvalidConfiguration('Missing controller.', appModule, `socketServer.routes[${name}]`);
    }
    let rpcControllerPath = path.resolve(controllersPath, info.controller + '.js');
    let isObj = false;
    const controllerObj = require(rpcControllerPath);
    if (typeof controllerObj === 'function') {
      eventHandlers = new controllerObj(appModule);
      isObj = true;
    } else {
      eventHandlers = controllerObj;
    }
    appModule.log('verbose', `[${serviceName}] controller "${info.controller}" is attached for namespace "${name}".`);
    const _eventHandlers = {};
    info.events && _.each(info.events, (methodName, eventName) => {
      if (typeof eventHandlers[methodName] === 'function') {
        _eventHandlers[eventName] = eventHandlers[methodName];
      }
    });
    function invoke(ctx, data, fn, cb) {
      console.log('invoke ..........');
      if (isObj) {
        fn = fn.bind(eventHandlers);
      }
      fn(ctx, data).then(result => result != null && cb && cb(result)).catch(logError);
    }
    namespaceChannel.on('connect', function (socket) {
      let ctx = {
        appModule,
        socket
      };
      _.forOwn(_eventHandlers, (handler, event) => {
        socket.on(event, (data, cb) => invoke(ctx, data, handler, cb));
      });
      if (eventHandlers.onConnect) {
        invoke(ctx, null, eventHandlers.onConnect);
      }
      log('verbose', 'namespace connect', {
        endpoint: endpointPath,
        port,
        id: socket.id,
        namespace: name
      });
    });
  });
  if (standalone) {
    io.listen(config.port);
  }
  return io;
}
module.exports = {
  type: Feature.PLUGIN,
  groupable: true,
  load_: (app, options, name) => {
    ensureFeatureName(name);
    let io = startSocketServer(app, name, options);
    app.registerService(name, io);
  }
};
//# sourceMappingURL=socketServer.js.map