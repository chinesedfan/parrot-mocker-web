'use strict';

module.exports = function*(next) {
    const callbackName = this.query.callback;
    const data = {
        code: 200,
        msg: 'good jsonp'
    };

    this.body = callbackName ? `${callbackName}(${JSON.stringify(data)})` : data;
};
