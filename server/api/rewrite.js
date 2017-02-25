'use strict';

const url = require('url');
const Cookie = require('../../common/cookie');

module.exports = function*(next) {
    // TODO: check the mock config to determine whether request or mock
    // console.log(this.query.url, this.query.cookie, this.query.reqtype);

    const parsed = url.parse(decodeURIComponent(this.query.url), true, true);
    const clientID = Cookie.getCookieItem(this.query.cookie, Cookie.KEY_CLIENT_ID);
    if (!clientID) {
        this.body = 'no clientID, ignored';
        return;
    }

    this.app.io.sockets.in(clientID).emit('mock-request-start', {
        method: this.request.method,
        host: parsed.host,
        pathname: parsed.pathname,
        timestamp: getNowInHHMMSS()
    });

    this.body = `${clientID}: rewrite success!`;
};

function getNowInHHMMSS() {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()].map(function(v) {
        return v < 10 ? '0' + v : v;
    }).join(':');
}
