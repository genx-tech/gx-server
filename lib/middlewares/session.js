"use strict";

require("source-map-support/register");

const session = require('koa-session');

const {
  InvalidConfiguration
} = require('../utils/Errors');

const {
  tryRequire
} = require('@genx/app/lib/utils/Helpers');

const DEFAULT_OPTS = {
  key: 'k-server.sid',
  prefix: 'k-server:sess:'
};

module.exports = (options, app) => {
  let store = options.store || {
    type: 'memory'
  };

  if (!store.type) {
    throw new InvalidConfiguration('Missing session store type.', app, 'middlewares.session.store');
  }

  let storeObject;
  let opt = store.options || {};

  if (store.dataSource) {
    let dsService = app.getService(store.dataSource);
    Object.assign(opt, {
      url: dsService.connectionString
    });
  }

  switch (store.type) {
    case 'redis':
      storeObject = tryRequire('koa-redis')(opt);
      break;

    case 'mysql':
      storeObject = tryRequire('koa-mysql-session')(opt);
      break;

    case 'mongodb':
      const MongoStore = tryRequire('koa-generic-session-mongo');
      storeObject = new MongoStore(opt);
      break;

    case 'pgsql':
      storeObject = tryRequire('koa-pg-session')(opt);
      break;

    case 'sqlite3':
      storeObject = tryRequire('koa-sqlite3-session')(opt);
      break;

    case 'memory':
      const MemoryStore = tryRequire('koa-session-memory');
      storeObject = new MemoryStore();
      break;

    default:
      throw new Mowa.Error.InvalidConfiguration('Unsupported session store type: ' + store.type, app, 'middlewares.session.store.type');
  }

  let sessionOptions = Object.assign({}, DEFAULT_OPTS, options, {
    store: storeObject
  });
  return session(sessionOptions, app.server.koa);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9taWRkbGV3YXJlcy9zZXNzaW9uLmpzIl0sIm5hbWVzIjpbInNlc3Npb24iLCJyZXF1aXJlIiwiSW52YWxpZENvbmZpZ3VyYXRpb24iLCJ0cnlSZXF1aXJlIiwiREVGQVVMVF9PUFRTIiwia2V5IiwicHJlZml4IiwibW9kdWxlIiwiZXhwb3J0cyIsIm9wdGlvbnMiLCJhcHAiLCJzdG9yZSIsInR5cGUiLCJzdG9yZU9iamVjdCIsIm9wdCIsImRhdGFTb3VyY2UiLCJkc1NlcnZpY2UiLCJnZXRTZXJ2aWNlIiwiT2JqZWN0IiwiYXNzaWduIiwidXJsIiwiY29ubmVjdGlvblN0cmluZyIsIk1vbmdvU3RvcmUiLCJNZW1vcnlTdG9yZSIsIk1vd2EiLCJFcnJvciIsInNlc3Npb25PcHRpb25zIiwic2VydmVyIiwia29hIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztBQU9BLE1BQU1BLE9BQU8sR0FBR0MsT0FBTyxDQUFDLGFBQUQsQ0FBdkI7O0FBQ0EsTUFBTTtBQUFFQyxFQUFBQTtBQUFGLElBQTJCRCxPQUFPLENBQUMsaUJBQUQsQ0FBeEM7O0FBQ0EsTUFBTTtBQUFFRSxFQUFBQTtBQUFGLElBQWlCRixPQUFPLENBQUMsNkJBQUQsQ0FBOUI7O0FBRUEsTUFBTUcsWUFBWSxHQUFHO0FBQ2pCQyxFQUFBQSxHQUFHLEVBQUUsY0FEWTtBQUVqQkMsRUFBQUEsTUFBTSxFQUFFO0FBRlMsQ0FBckI7O0FBdUJBQyxNQUFNLENBQUNDLE9BQVAsR0FBaUIsQ0FBQ0MsT0FBRCxFQUFVQyxHQUFWLEtBQWtCO0FBRS9CLE1BQUlDLEtBQUssR0FBR0YsT0FBTyxDQUFDRSxLQUFSLElBQWlCO0FBQUVDLElBQUFBLElBQUksRUFBRTtBQUFSLEdBQTdCOztBQUVBLE1BQUksQ0FBQ0QsS0FBSyxDQUFDQyxJQUFYLEVBQWlCO0FBQ2IsVUFBTSxJQUFJVixvQkFBSixDQUNGLDZCQURFLEVBRUZRLEdBRkUsRUFHRiwyQkFIRSxDQUFOO0FBS0g7O0FBRUQsTUFBSUcsV0FBSjtBQUVBLE1BQUlDLEdBQUcsR0FBR0gsS0FBSyxDQUFDRixPQUFOLElBQWlCLEVBQTNCOztBQUVBLE1BQUlFLEtBQUssQ0FBQ0ksVUFBVixFQUFzQjtBQUNsQixRQUFJQyxTQUFTLEdBQUdOLEdBQUcsQ0FBQ08sVUFBSixDQUFlTixLQUFLLENBQUNJLFVBQXJCLENBQWhCO0FBQ0FHLElBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjTCxHQUFkLEVBQW1CO0FBQUVNLE1BQUFBLEdBQUcsRUFBRUosU0FBUyxDQUFDSztBQUFqQixLQUFuQjtBQUNIOztBQUVELFVBQVFWLEtBQUssQ0FBQ0MsSUFBZDtBQUNJLFNBQUssT0FBTDtBQUNJQyxNQUFBQSxXQUFXLEdBQUdWLFVBQVUsQ0FBQyxXQUFELENBQVYsQ0FBd0JXLEdBQXhCLENBQWQ7QUFDQTs7QUFDSixTQUFLLE9BQUw7QUFDSUQsTUFBQUEsV0FBVyxHQUFHVixVQUFVLENBQUMsbUJBQUQsQ0FBVixDQUFnQ1csR0FBaEMsQ0FBZDtBQUNBOztBQUNKLFNBQUssU0FBTDtBQUNJLFlBQU1RLFVBQVUsR0FBR25CLFVBQVUsQ0FBQywyQkFBRCxDQUE3QjtBQUNBVSxNQUFBQSxXQUFXLEdBQUcsSUFBSVMsVUFBSixDQUFlUixHQUFmLENBQWQ7QUFDQTs7QUFDSixTQUFLLE9BQUw7QUFDSUQsTUFBQUEsV0FBVyxHQUFHVixVQUFVLENBQUMsZ0JBQUQsQ0FBVixDQUE2QlcsR0FBN0IsQ0FBZDtBQUNBOztBQUNKLFNBQUssU0FBTDtBQUNJRCxNQUFBQSxXQUFXLEdBQUdWLFVBQVUsQ0FBQyxxQkFBRCxDQUFWLENBQWtDVyxHQUFsQyxDQUFkO0FBQ0E7O0FBQ0osU0FBSyxRQUFMO0FBQ0ksWUFBTVMsV0FBVyxHQUFHcEIsVUFBVSxDQUFDLG9CQUFELENBQTlCO0FBQ0FVLE1BQUFBLFdBQVcsR0FBRyxJQUFJVSxXQUFKLEVBQWQ7QUFDQTs7QUFDSjtBQUNJLFlBQU0sSUFBSUMsSUFBSSxDQUFDQyxLQUFMLENBQVd2QixvQkFBZixDQUNGLHFDQUFxQ1MsS0FBSyxDQUFDQyxJQUR6QyxFQUVGRixHQUZFLEVBR0YsZ0NBSEUsQ0FBTjtBQXRCUjs7QUE2QkEsTUFBSWdCLGNBQWMsR0FBR1IsTUFBTSxDQUFDQyxNQUFQLENBQWMsRUFBZCxFQUFrQmYsWUFBbEIsRUFBZ0NLLE9BQWhDLEVBQXlDO0FBQUNFLElBQUFBLEtBQUssRUFBRUU7QUFBUixHQUF6QyxDQUFyQjtBQUVBLFNBQU9iLE9BQU8sQ0FBQzBCLGNBQUQsRUFBaUJoQixHQUFHLENBQUNpQixNQUFKLENBQVdDLEdBQTVCLENBQWQ7QUFDSCxDQXJERCIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFNlc3Npb24gbWlkZGxld2FyZVxuICogQG1vZHVsZSBNaWRkbGV3YXJlX1Nlc3Npb25cbiAqL1xuXG5jb25zdCBzZXNzaW9uID0gcmVxdWlyZSgna29hLXNlc3Npb24nKTtcbmNvbnN0IHsgSW52YWxpZENvbmZpZ3VyYXRpb24gfSA9IHJlcXVpcmUoJy4uL3V0aWxzL0Vycm9ycycpO1xuY29uc3QgeyB0cnlSZXF1aXJlIH0gPSByZXF1aXJlKCdAZ2VueC9hcHAvbGliL3V0aWxzL0hlbHBlcnMnKTtcblxuY29uc3QgREVGQVVMVF9PUFRTID0ge1xuICAgIGtleTogJ2stc2VydmVyLnNpZCcsXG4gICAgcHJlZml4OiAnay1zZXJ2ZXI6c2VzczonXG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgc2Vzc2lvbiBtaWRkbGV3YXJlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIFNlc3Npb24gb3B0aW9ucyBcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5rZXk9J21vd2E6c2lkJ10gLSBDb29raWUgbmFtZSBkZWZhdWx0aW5nIHRvIG1vd2Euc2lkIFxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLnByZWZpeD0nbW93YTpzZXNzOiddIC0gU2Vzc2lvbiBwcmVmaXggZm9yIHN0b3JlLCBkZWZhdWx0aW5nIHRvIG1vd2E6c2VzczpcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhBZ2VdIC0gU2Vzc2lvblN0b3JlJ3MgZXhwaXJhdGlvbiB0aW1lIChtcyksIGRlZmF1bHRpbmcgdG8gODY0MDAwMDAgKDEgZGF5KVxuICogQHByb3BlcnR5IHtib29sfSBbb3B0aW9ucy5hdXRvQ29tbWl0PXRydWVdIC0gQXV0b21hdGljYWxseSBjb21taXQgaGVhZGVycyAoZGVmYXVsdCB0cnVlKVxuICogQHByb3BlcnR5IHtib29sfSBbb3B0aW9ucy5vdmVyd3JpdGU9dHJ1ZV0gLSBDYW4gb3ZlcndyaXRlIG9yIG5vdCAoZGVmYXVsdCB0cnVlKSBcbiAqIEBwcm9wZXJ0eSB7Ym9vbH0gW29wdGlvbnMuaHR0cE9ubHk9dHJ1ZV0gLSBIdHRwT25seSBvciBub3QgKGRlZmF1bHQgdHJ1ZSlcbiAqIEBwcm9wZXJ0eSB7Ym9vbH0gW29wdGlvbnMuc2lnbmVkPXRydWVdIC0gU2lnbmVkIG9yIG5vdFxuICogQHByb3BlcnR5IHtib29sfSBbb3B0aW9ucy5yb2xsaW5nPWZhbHNlXSAtIEZvcmNlIGEgc2Vzc2lvbiBpZGVudGlmaWVyIGNvb2tpZSB0byBiZSBzZXQgb24gZXZlcnkgcmVzcG9uc2UuIFRoZSBleHBpcmF0aW9uIGlzIHJlc2V0IHRvIHRoZSBvcmlnaW5hbCBtYXhBZ2UsIHJlc2V0dGluZyB0aGUgZXhwaXJhdGlvbiBjb3VudGRvd24uIChkZWZhdWx0IGlzIGZhbHNlKSBcbiAqIEBwcm9wZXJ0eSB7Ym9vbH0gW29wdGlvbnMucmVuZXc9ZmFsc2VdIC0gUmVuZXcgc2Vzc2lvbiB3aGVuIHNlc3Npb24gaXMgbmVhcmx5IGV4cGlyZWQsIHNvIHdlIGNhbiBhbHdheXMga2VlcCB1c2VyIGxvZ2dlZCBpbi4gKGRlZmF1bHQgaXMgZmFsc2UpXG4gKiBAcHJvcGVydHkge2Z1bmN0aW9ufSBbb3B0aW9ucy5nZW5TaWRdIC0gVGhlIHdheSBvZiBnZW5lcmF0aW5nIGV4dGVybmFsIHNlc3Npb24gaWQgaXMgY29udHJvbGxlZCBieSB0aGUgb3B0aW9ucy5nZW5pZCwgd2hpY2ggZGVmYXVsdHMgdG8gRGF0ZS5ub3coKSArICctJyArIHVpZC5zeW5jKDI0KVxuICogQHByb3BlcnR5IHtmdW5jdGlvbn0gW29wdGlvbnMudmFsaWRdIC0gdmFsaWQoY3R4LCBzZXNzaW9uKSwgdmFsaWQgc2Vzc2lvbiB2YWx1ZSBiZWZvcmUgdXNlIGl0XG4gKiBAcHJvcGVydHkge2Z1bmN0aW9ufSBbb3B0aW9ucy5iZWZvcmVTYXZlXSAtIGJlZm9yZVNhdmUoY3R4LCBzZXNzaW9uKSwgaG9vayBiZWZvcmUgc2F2ZSBzZXNzaW9uXG4gKiBAcHJvcGVydHkge29iamVjdH0gW29wdGlvbnMuc3RvcmVdIC0gU2Vzc2lvbiBzdG9yZSBpbnN0YW5jZS4gSXQgY2FuIGJlIGFueSBPYmplY3QgdGhhdCBoYXMgdGhlIG1ldGhvZHMgc2V0LCBnZXQsIGRlc3Ryb3kgbGlrZSBNZW1vcnlTdG9yZS5cbiAqIEBwYXJhbSB7Um91dGFibGV9IGFwcCBcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAob3B0aW9ucywgYXBwKSA9PiB7XG5cbiAgICBsZXQgc3RvcmUgPSBvcHRpb25zLnN0b3JlIHx8IHsgdHlwZTogJ21lbW9yeScgfTtcblxuICAgIGlmICghc3RvcmUudHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZENvbmZpZ3VyYXRpb24oXG4gICAgICAgICAgICAnTWlzc2luZyBzZXNzaW9uIHN0b3JlIHR5cGUuJyxcbiAgICAgICAgICAgIGFwcCxcbiAgICAgICAgICAgICdtaWRkbGV3YXJlcy5zZXNzaW9uLnN0b3JlJ1xuICAgICAgICApOyAgICAgICAgXG4gICAgfVxuXG4gICAgbGV0IHN0b3JlT2JqZWN0O1xuXG4gICAgbGV0IG9wdCA9IHN0b3JlLm9wdGlvbnMgfHwge307XG5cbiAgICBpZiAoc3RvcmUuZGF0YVNvdXJjZSkge1xuICAgICAgICBsZXQgZHNTZXJ2aWNlID0gYXBwLmdldFNlcnZpY2Uoc3RvcmUuZGF0YVNvdXJjZSk7XG4gICAgICAgIE9iamVjdC5hc3NpZ24ob3B0LCB7IHVybDogZHNTZXJ2aWNlLmNvbm5lY3Rpb25TdHJpbmcgfSk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChzdG9yZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3JlZGlzJzpcbiAgICAgICAgICAgIHN0b3JlT2JqZWN0ID0gdHJ5UmVxdWlyZSgna29hLXJlZGlzJykob3B0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdteXNxbCc6XG4gICAgICAgICAgICBzdG9yZU9iamVjdCA9IHRyeVJlcXVpcmUoJ2tvYS1teXNxbC1zZXNzaW9uJykob3B0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb25nb2RiJzpcbiAgICAgICAgICAgIGNvbnN0IE1vbmdvU3RvcmUgPSB0cnlSZXF1aXJlKCdrb2EtZ2VuZXJpYy1zZXNzaW9uLW1vbmdvJyk7XG4gICAgICAgICAgICBzdG9yZU9iamVjdCA9IG5ldyBNb25nb1N0b3JlKG9wdCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGdzcWwnOlxuICAgICAgICAgICAgc3RvcmVPYmplY3QgPSB0cnlSZXF1aXJlKCdrb2EtcGctc2Vzc2lvbicpKG9wdCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc3FsaXRlMyc6XG4gICAgICAgICAgICBzdG9yZU9iamVjdCA9IHRyeVJlcXVpcmUoJ2tvYS1zcWxpdGUzLXNlc3Npb24nKShvcHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21lbW9yeSc6XG4gICAgICAgICAgICBjb25zdCBNZW1vcnlTdG9yZSA9IHRyeVJlcXVpcmUoJ2tvYS1zZXNzaW9uLW1lbW9yeScpO1xuICAgICAgICAgICAgc3RvcmVPYmplY3QgPSBuZXcgTWVtb3J5U3RvcmUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IE1vd2EuRXJyb3IuSW52YWxpZENvbmZpZ3VyYXRpb24oXG4gICAgICAgICAgICAgICAgJ1Vuc3VwcG9ydGVkIHNlc3Npb24gc3RvcmUgdHlwZTogJyArIHN0b3JlLnR5cGUsXG4gICAgICAgICAgICAgICAgYXBwLFxuICAgICAgICAgICAgICAgICdtaWRkbGV3YXJlcy5zZXNzaW9uLnN0b3JlLnR5cGUnXG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIGxldCBzZXNzaW9uT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfT1BUUywgb3B0aW9ucywge3N0b3JlOiBzdG9yZU9iamVjdH0pO1xuXG4gICAgcmV0dXJuIHNlc3Npb24oc2Vzc2lvbk9wdGlvbnMsIGFwcC5zZXJ2ZXIua29hKTtcbn07Il19