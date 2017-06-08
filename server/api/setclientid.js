'use strict';

const Cookie = require('../../common/cookie');
const UrlParams = require('../../common/urlparams');

module.exports = function*(next) {
    const clientID = this.query[UrlParams.URL_PARAM_CLIENT_ID];
    if (!clientID) {
        this.body = {
            code: 500,
            msg: 'no clientID, ignored'
        };
        return;
    }

    // keep the same with web UI, host-only cookie
    const cookieStr = Cookie.generateCookieItem(Cookie.KEY_CLIENT_ID, clientID, Infinity, '/', '');
    this.response.set('set-cookie', cookieStr);
    this.body = {
        code: 200,
        msg: 'success',
        data: {
            clientID
        }
    };
};
