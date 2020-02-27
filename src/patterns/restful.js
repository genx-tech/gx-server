const http = require('http');
const { _ } = require('rk-utils');

const statusToError = {
    400: 'invalid_request',
    404: 'resource_not_found'
};

const unknownError = 'unknown_error';

const wrapRequest = (ctx) => { 
    let req = {
        method: ctx.method,
        endpoint: ctx._matchedRoute,
        query: _.toPlainObject(ctx.query)
    };

    if (!_.isEmpty(ctx.params)) {
        req.params = ctx.params
    }

    return req;
};

exports.wrapQuery = (ctx, actualQuery, result, extra) => {
    let { status, ...others } = extra || {};
    let request = wrapRequest(ctx);    

    if (status && status !== 200) {
        ctx.status = status;

        status = 'error';

        others = {
            code: statusToError[ctx.status] || unknownError,
            ...others
        };
    } else {
        status = 'success';
    }

    return {
        status,
        request,
        actualQuery,
        response: result,        
        ...others
    };
};

exports.wrapError = (ctx, error) => {
    let request = wrapRequest(ctx);    

    let response = { 
        message: error.expose ? error.message : http.STATUS_CODES[ctx.status]
    };

    let code = statusToError[ctx.status] || unknownError;

    return {
        status: 'error',
        code,
        request,
        response
    };
};

exports.wrapOperation = (ctx, operation, result, extra) => {
    let { status, ...others } = extra || {};
    let request = wrapRequest(ctx); 

    if (status && status !== 200) {
        ctx.status = status;

        status = 'error';

        others = { 
            code: statusToError[ctx.status] || unknownError,
            ...others
        };       
        
    } else {
        status = 'success';
    } 

    return {
        status,
        request,
        operation,
        response: result,        
        ...others
    };
}