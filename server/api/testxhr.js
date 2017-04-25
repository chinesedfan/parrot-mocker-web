'use strict';

module.exports = function*(next) {
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
