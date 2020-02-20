exports.Controller = require('./Controller');
exports.rest = require('./restful');
exports.http = require('./httpMethod');

//shortcut to load middlewares from cached store
exports.middleware = (...names) => names.map(name => ({ name: 'fromStore', options: name }));    