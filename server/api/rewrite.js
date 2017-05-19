'use strict';

const stream = require('stream');
const url = require('url');
const _ = require('lodash');
const qs = require('qs');
const typeis = require('type-is');
const bodyParser = require('co-body');
const Cookie = require('../../common/cookie');
const Message = require('../../common/message');
const MockConfig = require('../mockconfig.js');
const API_PATH = '/api/rewrite';
let gid = 0;

module.exports = function*(next) {
    const parsed = url.parse(this.query.url, true, true);
    const clientID = Cookie.getCookieItem(this.query.cookie, Cookie.KEY_CLIENT_ID);
    if (!clientID) {
        this.body = 'no clientID, ignored';
        return;
    }

    // parse the request body
    this.request.rawBody = yield bodyParser.text(this.req);
    this.request.body = getBodyObject(this, this.request.rawBody);

    // check the mock config to determine whether request or mock
    const config = MockConfig.getConfig(clientID, parsed);
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

    const data = yield requestPromise(this, config);
    // TODO: delay if needs
    data.id = id;
    data.timecost = new Date().getTime() - starttime;
    socket.emit(Message.MSG_REQUEST_END, data);
};

function getNowInHHMMSS() {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()].map((v) => {
        return v < 10 ? '0' + v : v;
    }).join(':');
}
function getPortFromHost(host, isHttps) {
    let port = isHttps ? '443' : '80';
    if (host && host.indexOf(':') >= 0) {
        port = host.split(':')[1];
    }
    return port;
}
function getRewriteUrl(ctx, urlStr, cookie, reqtype) {
    const mockServer = Cookie.getCookieItem(ctx.query.cookie, Cookie.KEY_SERVER);
    const parsed = url.parse(mockServer, true, true);
    return url.format({
        protocol: parsed.protocol,
        host: parsed.host,
        pathname: API_PATH,
        query: {
            url: urlStr,
            cookie,
            reqtype
        }
    });
}
function getBodyObject(ctx, raw) {
    const jsonTypes = ['json', 'application/*+json', 'application/csp-report'];
    const formTypes = ['urlencoded'];

    let body = raw;
    // TODO: it is better to clone `ctx.req` and ask `co-body` to parse
    if (typeis(ctx.req, jsonTypes)) {
        try {
            body = JSON.parse(body);
        } catch (e) {
            // ignore
        }
    } else if (typeis(ctx.req, formTypes)) {
        try {
            body = qs.parse(body);
        } catch (e) {
            // ignore
        }
    }
    return body;
}
function isProtocolHttps(protocol) {
    return protocol === 'https:';
}
function isLocalHost(host) {
    return host && host.indexOf('local') >= 0;
}

function sendRealRequest(ctx) {
    let status, responseHeaders, responseBody;

    let apiUrl = ctx.query.url;
    const parsed = url.parse(ctx.query.url, true, true);
    // complete the url
    if (!parsed.protocol) {
        parsed.protocol = ctx.protocol;
        apiUrl = url.format(parsed);
    }
    if (!parsed.host) {
        if (isLocalHost(ctx.query.host)) {
            parsed.host = ctx.ip + ':' + getPortFromHost(ctx.query.host, isProtocolHttps(parsed.protocol));
        } else {
            parsed.host = ctx.query.host;
        }
        apiUrl = url.format(parsed);
    }

    const options = {
        method: ctx.request.method,
        headers: _.extend({}, ctx.request.headers, {
            // TODO: if want to mock host
            host: parsed.host,
            cookie: ctx.query.cookie
        }),
        timeout: 10000,
        // custom options
        handleRedirect(urlStr) {
            return getRewriteUrl(ctx, urlStr, ctx.query.cookie, ctx.query.reqtype);
        },
        handleRes(res) {
            // trust kcors to handle these headers
            _.each(['access-control-allow-origin', 'access-control-allow-credentials'], (key) => {
                const val = ctx.response.headers[key];
                if (val) {
                    res.headers[key] = val;
                }
            });

            // fill in koa context
            ctx.status = res.statusCode;
            ctx.response.set(res.headers);
            ctx.body = res.pipe(new stream.PassThrough());

            // save for mock web
            status = ctx.status;
            responseHeaders = res.headers;
        }
    };
    // handle post data
    if (options.method.toUpperCase() === 'POST') {
        options.body = ctx.request.rawBody;
    }

    // real request
    return ctx.fetch(apiUrl, options).then((res) => {
        return res.text();
    }).then((text) => {
        if (ctx.query.reqtype == 'jsonp') {
            text = text.replace(/^[^{\(]*?\(/, '').replace(/\);?$/, '');
        }
        if (text) {
            // save first then try to parse
            responseBody = text;
            try {
                responseBody = JSON.parse(text);
            } catch (e) {
                // ignore if failed to parse
            }
        }
    }).catch((e) => {
        status = 500;
        responseBody = responseBody || e.stack;
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
    const responseHeaders = ctx.response.headers;
    let responseBody = config.response;

    // response directly
    if (ctx.query.reqtype == 'jsonp') {
        const parsed = url.parse(ctx.query.url, true, true);
        const callbackKey = (config && config.callback) || 'callback';
        responseBody = parsed.query[callbackKey] + '(' + JSON.stringify(responseBody) + ')';
    }
    ctx.body = responseBody;

    return Promise.resolve({
        status,
        responseHeaders,
        responseBody
    });
}
