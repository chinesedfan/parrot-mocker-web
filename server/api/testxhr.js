'use strict';

const bodyParser = require('co-body');

module.exports = function*(next) {
    const debug = require('debug')('parrot-mocker:testxhr');

    if (this.request.method.toUpperCase() === 'POST') {
        this.request.body = yield bodyParser(this.req);
    } else {
        this.request.body = this.query;
    }

    debug('before this.body');
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
