"use strict";
require("source-map-support/register");
const path = require('path');
const {
  InvalidConfiguration
} = require('@genx/error');
const Literal = require('../enum/Literal');
module.exports = (controllerAction, app) => {
  if (typeof controllerAction !== 'string') {
    throw new InvalidConfiguration('Invalid action syntax.', app);
  }
  let pos = controllerAction.lastIndexOf('.');
  if (pos < 0) {
    throw new InvalidConfiguration(`Unrecognized controller & action syntax: ${controllerAction}.`, app);
  }
  let controller = controllerAction.substr(0, pos);
  let action = controllerAction.substr(pos + 1);
  let controllerBasePath = path.join(app.backendPath, Literal.CONTROLLERS_PATH);
  let controllerPath = path.resolve(controllerBasePath, controller + '.js');
  let ctrl = require(controllerPath);
  let actioner = ctrl[action];
  if (Array.isArray(actioner)) {
    let actionFunction = actioner.concat().pop();
    if (typeof actionFunction !== 'function') {
      throw new InvalidConfiguration(`${controllerAction} does not contain a valid action in returned middleware chain.`, app);
    }
    return actioner.concat(actionFunction);
  }
  if (typeof actioner !== 'function') {
    throw new InvalidConfiguration(`${controllerAction} is not a valid action.`, app);
  }
  return actioner;
};
//# sourceMappingURL=action.js.map