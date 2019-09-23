"use strict";

module.exports = {    
    WebServer: require('./WebServer'),
    enum: {
        Literal: require('./enum/Literal'),
        Feature: require('@genx/app/lib/enum/Feature')
    },
    http: require('./decorators/httpMethod'),
    middleware: (...names) => names.map(name => ({ name: 'fromStore', options: name })),    
    Controller: require('./patterns/Controller'),
    Errors: require('./utils/Errors') 
};