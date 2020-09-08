"use strict";

const Enums = {
    Literal: require('./enum/Literal'),
    Feature: require('@genx/app/lib/enum/Feature')
};

const Patterns = require('./patterns');

module.exports = {    
    WebServer: require('./WebServer'),   
    LibModule: require('./LibModule'),    
    Errors: require('./utils/Errors'),
    Helpers: require('./utils/Helpers'),
    Enums,    
    Patterns,        
    
    // compatible to legacy code
    enum: Enums, 
    http: Patterns.http,
    middleware: Patterns.middleware,    
    Controller: Patterns.Controller 
};