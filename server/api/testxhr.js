'use strict';

const bodyParser = require('co-body');

module.exports = function*(next) {
    this.request.body = yield bodyParser(this.req);

    this.body = {
        code: 200,
        msg: 'good xhr',
        data: {
            method: this.request.method,
            requestHeaders: this.request.headers,
            requestData: this.request.body
        }
    };
};
