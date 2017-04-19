'use strict';

module.exports = function*(next) {
    this.body = {
        code: 200,
        msg: 'good fetch'
    };
};
