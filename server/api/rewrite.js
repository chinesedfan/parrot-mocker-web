'use strict';

const url = require('url');
const _ = require('lodash');
const Cookie = require('../../common/cookie');
const Message = require('../../common/message');
const MockConfig = require('../mockconfig.js');
let gid = 0;

module.exports = function*(next) {
    const parsed = url.parse(this.query.url, true, true);
    const clientID = Cookie.getCookieItem(this.query.cookie, Cookie.KEY_CLIENT_ID);
    if (!clientID) {
        this.body = 'no clientID, ignored';
        return;
    }

    // check the mock config to determine whether request or mock
    const configList = MockConfig.getConfig(clientID);
    const config = getMockConfig(configList, parsed.pathname);
    const isMock = !!config;
    const requestPromise = isMock ? sendMockResponse : sendRealRequest;

    const socket = this.app.io.sockets.in(clientID);
    const id = ++gid;
    const starttime = new Date().getTime();
    socket.emit(Message.MSG_REQUEST_START, {
        id,
        isMock,
        method: this.request.method,
        host: parsed.host || this.query.host,
        pathname: parsed.pathname,
        timestamp: getNowInHHMMSS(),
        timecost: -1,
        //
        url: this.query.url,
        requestHeaders: this.header,
        requestData: this.request.body
    });

    this.body = yield requestPromise(this, config).then((data) => {
        data.id = id;
        data.timecost = new Date().getTime() - starttime;
        socket.emit(Message.MSG_REQUEST_END, data);

        if (this.query.reqtype == 'jsonp') {
            const callbackKey = (config && config.callback) || 'callback';
            data.responseBody = parsed.query[callbackKey] + '(' + JSON.stringify(data.responseBody) + ')';
        }
        return data.responseBody;
    });
};

function getNowInHHMMSS() {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()].map((v) => {
        return v < 10 ? '0' + v : v;
    }).join(':');
}
function getPortFromHost(host) {
    let port = '80';
    if (host && host.indexOf(':')) {
        port = host.split(':')[1];
    }
    return port;
}
function getMockConfig(configList, pathname) {
    return _.find(configList, (cfg) => cfg.path === pathname);
}

function sendRealRequest(ctx) {
    let status, responseHeaders, responseBody;

    let apiUrl = ctx.query.url;
    const parsed = url.parse(ctx.query.url, true, true);
    if (!parsed.protocol) {
        parsed.protocol = ctx.protocol;
        apiUrl = url.format(parsed);
    }
    if (!parsed.host) {
        parsed.host = ctx.ip + ':' + getPortFromHost(ctx.query.host);
        apiUrl = url.format(parsed);
    }

    return ctx.fetch(apiUrl, {
        method: ctx.request.method,
        headers: {
            cookie: ctx.query.cookie
        },
        timeout: 10000
    }).then((res) => {
        status = res.status;
        res.headers.forEach((v, k) => {
            k = k.toLowerCase();
            // trust kcors to handle these headers
            if (k === 'access-control-allow-origin' || k === 'access-control-allow-credentials') return;
            // no encoding
            if (k === 'content-encoding') return;

            ctx.response.set(k, v);
        });
        responseHeaders = ctx.response.headers;
        return res.text();
    }).then((text) => {
        if (ctx.query.reqtype == 'jsonp') {
            text = text.replace(/^[^{\(]*?\(/, '').replace(/\);?$/, '');
        }
        if (text) {
            // always parsed as json
            responseBody = JSON.parse(text);
        }
    }).catch((e) => {
        status = 500;
        responseBody = e.stack;
    }).then(() => {
        return {
            status,
            responseHeaders,
            responseBody
        };
    });
}
function sendMockResponse(ctx, config) {
    const status = config.status;
    const responseBody = config.response;
    const responseHeaders = ctx.response.headers;

    return Promise.resolve({
        status,
        responseHeaders,
        responseBody
    });
}
