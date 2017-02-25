'use strict';

const url = require('url');
const Cookie = require('../../common/cookie');
const Message = require('../../common/message');
let gid = 0;

module.exports = function*(next) {
    // console.log(this.query.url, this.query.cookie, this.query.reqtype);

    const parsed = url.parse(decodeURIComponent(this.query.url), true, true);
    const clientID = Cookie.getCookieItem(this.query.cookie, Cookie.KEY_CLIENT_ID);
    if (!clientID) {
        this.body = 'no clientID, ignored';
        return;
    }

    const socket = this.app.io.sockets.in(clientID);
    const id = ++gid;
    const starttime = new Date().getTime();
    socket.emit(Message.MSG_REQUEST_START, {
        id,
        method: this.request.method,
        host: parsed.host,
        pathname: parsed.pathname,
        timestamp: getNowInHHMMSS(),
        //
        url: decodeURIComponent(this.query.url),
        requestHeaders: this.header,
        requestData: this.request.body
    });
    // TODO: check the mock config to determine whether request or mock
    sendRealRequest(this).then((data) => {
        data.id = id;
        data.timecost = new Date().getTime() - starttime;
        socket.emit(Message.MSG_REQUEST_END, data);
    });

    this.body = `${clientID}: rewrite success!`;
};

function getNowInHHMMSS() {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()].map((v) => {
        return v < 10 ? '0' + v : v;
    }).join(':');
}

function sendRealRequest(ctx) {
    let status, responseHeaders, responseBody;

    return ctx.fetch(ctx.query.url, {
        method: ctx.request.method,
        headers: {
            cookie: ctx.query.cookie
        },
        timeout: 10000
    }).then((res) => {
        status = res.status;
        responseHeaders = {};
        res.headers.forEach((v, k) => {
            responseHeaders[k] = v;
        });
        return res.text();
    }).then((text) => {
        if (ctx.query.reqtype == 'jsonp') {
            text = text.replace(/^[^{\(]*?\(/, '').replace(/\);?$/, '');
        }
        // always parsed as json
        responseBody = JSON.parse(text);
    }).catch((e) => {
        status = 500;
        console.log(e.stack);
    }).then(() => {
        return {
            status,
            responseHeaders,
            responseBody
        };
    });
}
