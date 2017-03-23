'use strict';

const Cookie = require('../../common/cookie');
const MockConfig = require('../mockconfig.js');

module.exports = function*(next) {
    const clientID = Cookie.getCookieItem(this.request.headers.cookie, Cookie.KEY_CLIENT_ID);
    if (!clientID) {
        this.body = {
            code: 500,
            msg: 'no clientID, ignored'
        };
        return;
    }

    this.body = {
        code: 200,
        msg: JSON.stringify(MockConfig.getConfig(clientID))
    };
};
