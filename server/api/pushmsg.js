'use strict';

const url = require('url');
const bodyParser = require('co-body');
const Message = require('../../common/message');

let gid = 0;
let debug;

module.exports = function*(next) {
    debug = require('debug')('parrot-mocker:pushmsg');

    const body = yield bodyParser(this.req); // {clientID, startData, endData}
    debug('getBodyObject');
    const clientID = body.clientID;
    if (!clientID) {
        this.body = {
            code: 500,
            msg: 'no clientID, ignored'
        };
        return;
    }

    const socket = this.app.io.sockets.in(clientID);
    const id = `push-${++gid}`;

    const parsed = url.parse(body.url, true, true);
    socket.emit(Message.MSG_REQUEST_START, {
        id,
        isMock: false,
        method: body.method,
        host: parsed.host,
        pathname: parsed.pathname,
        timestamp: body.timestamp,
        timecost: -1,
        //
        url: url.format(parsed)
    });
    socket.emit(Message.MSG_REQUEST_END, {
        id,
        status: body.status,
        timecost: body.timecost,
        requestData: body.method && body.method.toLowerCase() === 'post' ? body.requestData : 'not POST request',
        requestHeaders: body.requestHeaders,
        responseHeaders: body.responseHeaders,
        responseBody: body.responseBody
    });

    this.body = {
        code: 200,
        msg: 'good push'
    };
};
