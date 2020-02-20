"use strict";

require("source-map-support/register");

exports.Controller = require('./controller');
exports.rest = require('./restful');
exports.http = require('./httpMethod');

exports.middleware = (...names) => names.map(name => ({
  name: 'fromStore',
  options: name
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXR0ZXJucy9pbmRleC5qcyJdLCJuYW1lcyI6WyJleHBvcnRzIiwiQ29udHJvbGxlciIsInJlcXVpcmUiLCJyZXN0IiwiaHR0cCIsIm1pZGRsZXdhcmUiLCJuYW1lcyIsIm1hcCIsIm5hbWUiLCJvcHRpb25zIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUFBLE9BQU8sQ0FBQ0MsVUFBUixHQUFxQkMsT0FBTyxDQUFDLGNBQUQsQ0FBNUI7QUFDQUYsT0FBTyxDQUFDRyxJQUFSLEdBQWVELE9BQU8sQ0FBQyxXQUFELENBQXRCO0FBQ0FGLE9BQU8sQ0FBQ0ksSUFBUixHQUFlRixPQUFPLENBQUMsY0FBRCxDQUF0Qjs7QUFHQUYsT0FBTyxDQUFDSyxVQUFSLEdBQXFCLENBQUMsR0FBR0MsS0FBSixLQUFjQSxLQUFLLENBQUNDLEdBQU4sQ0FBVUMsSUFBSSxLQUFLO0FBQUVBLEVBQUFBLElBQUksRUFBRSxXQUFSO0FBQXFCQyxFQUFBQSxPQUFPLEVBQUVEO0FBQTlCLENBQUwsQ0FBZCxDQUFuQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydHMuQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vY29udHJvbGxlcicpO1xuZXhwb3J0cy5yZXN0ID0gcmVxdWlyZSgnLi9yZXN0ZnVsJyk7XG5leHBvcnRzLmh0dHAgPSByZXF1aXJlKCcuL2h0dHBNZXRob2QnKTtcblxuLy9zaG9ydGN1dCB0byBsb2FkIG1pZGRsZXdhcmVzIGZyb20gY2FjaGVkIHN0b3JlXG5leHBvcnRzLm1pZGRsZXdhcmUgPSAoLi4ubmFtZXMpID0+IG5hbWVzLm1hcChuYW1lID0+ICh7IG5hbWU6ICdmcm9tU3RvcmUnLCBvcHRpb25zOiBuYW1lIH0pKTsgICAgIl19