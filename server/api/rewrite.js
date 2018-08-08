'use strict';

const stream = require('stream');
const url = require('url');
const _ = require('lodash');
const bodyParser = require('co-body');
const MockJS = require('mockjs');
const Cookie = require('../../common/cookie');
const Message = require('../../common/message');
const MockConfig = require('../mockconfig.js');

const API_PATH = '/api/rewrite';
const MAX_POST_DATA = 1024 * 1024;
let gid = 0;
let debug;

/**
 * Parameters in this.query
 *
 * @param {String} url - the forwarded request url, with query parameters
 * @param {String} cookie - document.cookie
 * @param {String} reqtype - request type, i.e. jsonp
 * @param {String} host - deprecated, the forwarded request host
 */
module.exports = function*(next) {
    const clientID = Cookie.getCookieItem(this.query.cookie, Cookie.KEY_CLIENT_ID);
    if (!clientID) {
        this.body = 'no clientID, ignored';
        return;
    }
    debug = require('debug')('parrot-mocker:rewrite');

    // parse the request body
    this.request.rawBody = this.req.pipe(new stream.PassThrough({
        highWaterMark: MAX_POST_DATA
    })); // keep as stream
    this.request.body = yield getBodyObject(this);
    debug('getBodyObject', `clientID=${clientID} this.query.url=${this.query.url}`);

    // check the mock config to determine whether request or mock
    let parsed = url.parse(this.query.url, true, true);
    const config = MockConfig.getConfig(clientID, _.extend({}, parsed, {
        // for valid POST data, pretend it to be parsed query
        query: _.isObject(this.request.body) ? this.request.body : parsed.query
    }));
    const isMock = !!config;
    const requestPromise = (config && !config.host) ? sendMockResponse : sendRealRequest;

    const socket = this.app.io.sockets.in(clientID);
    const id = ++gid;
    const starttime = new Date().getTime();
    parsed = getParsedRequestUrl(this, config);
    socket.emit(Message.MSG_REQUEST_START, {
        id,
        isMock,
        method: this.request.method,
        host: parsed.host,
        pathname: parsed.pathname,
        timestamp: getNowInHHMMSS(),
        timecost: -1,
        //
        url: url.format(parsed)
    });

    // delay if needs
    const delay = config ? config.delay || 0 : 0;
    yield delayPromise(delay);

    const data = yield requestPromise(this, config, parsed);
    data.id = id;
    data.timecost = new Date().getTime() - starttime;
    socket.emit(Message.MSG_REQUEST_END, data);
};

function getNowInHHMMSS() {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()].map((v) => {
        /* istanbul ignore next */
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
function getParsedRequestUrl(ctx, config) {
    const parsed = url.parse(ctx.query.url, true, true);
    // complete the url
    if (!parsed.protocol) {
        parsed.protocol = ctx.protocol;
    }
    if (config && config.host) {
        parsed.host = config.host;
    }
    if (config && config.prepath) {
        parsed.pathname = config.prepath + parsed.pathname;
    }
    if (!parsed.host) {
        if (isLocalHost(ctx.query.host)) {
            parsed.host = ctx.ip + ':' + getPortFromHost(ctx.query.host, isProtocolHttps(parsed.protocol));
        } else {
            parsed.host = ctx.query.host;
        }
    }
    return parsed;
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
function getBodyObject(ctx) {
    if (ctx.request.method.toUpperCase() !== 'POST') return Promise.resolve('not POST request');

    // clone `ctx.req` and ask `co-body` to parse
    const req = ctx.req.pipe(new stream.PassThrough({
    }));
    req.headers = ctx.req.headers;

    return bodyParser(req).catch((e) => {
        return e.message;
    });
}
function getCleanCookie(cookie) {
    /* istanbul ignore if */
    if (!cookie) return cookie;

    cookie = Cookie.removeCookieItem(cookie, Cookie.KEY_ENABLED);
    cookie = Cookie.removeCookieItem(cookie, Cookie.KEY_CLIENT_ID);
    cookie = Cookie.removeCookieItem(cookie, Cookie.KEY_SERVER);
    return cookie;
}
function getCleanReqHeaders(headers) {
    const ret = {};

    // filter CloudFlare related headers, because CloudFlare to CloudFlare is prohibited
    for (let key in headers) {
        if (/^cf-/.test(key)) {
            debug('getCleanReqHeaders', `delete ${key}: ${headers[key]}`);
        } else {
            ret[key] = headers[key];
        }
    }

    return ret;
}
function isProtocolHttps(protocol) {
    return protocol === 'https:';
}
function isLocalHost(host) {
    return host && host.indexOf('local') >= 0;
}

function sendRealRequest(ctx, config, parsed) {
    let status, responseHeaders, responseBody;

    const apiUrl = url.format(parsed);
    const options = {
        method: ctx.request.method,
        headers: _.extend({}, getCleanReqHeaders(ctx.request.headers), {
            host: parsed.host,
            cookie: getCleanCookie(ctx.query.cookie)
        }),
        timeout: 10000,
        // custom options
        handleRedirect(urlStr) {
            debug('handleRedirect', `urlStr=${urlStr}`);
            return getRewriteUrl(ctx, urlStr, ctx.query.cookie, ctx.query.reqtype);
        },
        handleRes(res) {
            debug('handleRes', `ctx.query.url=${ctx.query.url} res.statusCode=${res.statusCode}`);
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
            ctx.body = res.pipe(new stream.PassThrough({
                highWaterMark: MAX_POST_DATA
            }));

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
    debug('sendRealRequest', `apiUrl=${apiUrl}`);
    return ctx.fetch(apiUrl, options).then((res) => {
        return res.text();
    }).then((text) => {
        debug('sendRealRequest.then', `text=${text && text.substr(0, 100)}`);

        const realText = text;
        if (ctx.query.reqtype == 'jsonp') {
            text = text.replace(/^[^{\(]*?\(/, '').replace(/\);?$/, '');
        }
        if (text) {
            try {
                responseBody = JSON.parse(text);
            } catch (e) {
                responseBody = realText;
            }
        }
    }).catch((e) => {
        debug('sendRealRequest.catch', `e.message=${e.message}`);

        status = 500;
        responseBody = responseBody || e.stack;
    }).then(() => {
        return {
            status,
            requestHeaders: options.headers,
            requestData: ctx.request.body,
            responseHeaders,
            responseBody
        };
    });
}
function sendMockResponse(ctx, config, parsed) {
    debug('sendMockResponse', `ctx.query.url=${ctx.query.url}`);

    const status = config.status;
    const responseHeaders = ctx.response.headers;
    let responseBody = config.response;

    // response directly
    ctx.status = status;

    // handle data generation
    switch (config.responsetype) {
    case 'mockjs':
        responseBody = MockJS.mock(config.response);
        break;
    default:
        break;
    }

    // handle jsonp
    if (ctx.query.reqtype == 'jsonp') {
        const callbackKey = (config && config.callback) || 'callback';
        ctx.body = parsed.query[callbackKey] + '(' + JSON.stringify(responseBody) + ')';
    } else {
        ctx.body = responseBody;
    }

    return Promise.resolve({
        status,
        requestHeaders: ctx.header,
        requestData: ctx.request.body,
        responseHeaders,
        responseBody
    });
}
function delayPromise(delay) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}
