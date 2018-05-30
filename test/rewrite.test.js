'use strict';

const fetch = require('node-fetch');
const request = require('supertest');
const koa = require('koa');
const kcors = require('kcors');
const fetchMiddleware = require('../server/fetch.js');
const updateconfig = require('../server/api/updateconfig.js');
const rewrite = require('../server/api/rewrite.js');
const {KEY_CLIENT_ID, generateCookieItem} = require('../common/cookie.js');
const Message = require('../common/message.js');

const RETRY_LIMIT = 3;
const host = 'https://parrotmocker.leanapp.cn';

function prepareMiddlewares(app) {
    app.use(fetchMiddleware);
    app.use(kcors({
        credentials: true
    }));
    app.use(function*(next) {
        const path = this.path;
        if (path === '/api/updateconfig') {
            yield* updateconfig.call(this, next);
        } else if (path === '/api/rewrite'){
            yield* rewrite.call(this, next);
        }
    });
}
function prepareSocketIO(app) {
    const socket = {
        emit: jest.fn()
    };
    const io = {
        sockets: {
            in: jest.fn().mockReturnValue(socket)
        }
    };

    app.io = io;
    app.mockSocket = socket; // for testing
}

function wakeupTestServer(retry) {
    return fetch(host + '/api/test')
        .catch(() => {
            if (retry) return wakeupTestServer(retry - 1);
        });
}

describe('/api/rewrite', () => {
    let app;

    beforeAll(() => {
        app = koa();
        prepareMiddlewares(app);
        prepareSocketIO(app);

        jest.setTimeout(RETRY_LIMIT * 5000);
        return wakeupTestServer(RETRY_LIMIT);
    });
    beforeEach(() => {
        app.mockSocket.emit.mockClear();
    });
    describe('forward', () => {
        it('should ignore if no client id', () => {
            return request(app.callback())
                .get('/api/rewrite')
                .expect('no clientID, ignored');
        });
        it('should forward GET request', async () => {
            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: host + '/api/test',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect('I am running!');

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: false,
                method: 'GET',
                host: 'parrotmocker.leanapp.cn',
                pathname: '/api/test',
                url: host + '/api/test'
            }));
            expect(app.mockSocket.emit).nthCalledWith(2, Message.MSG_REQUEST_END, expect.objectContaining({
                status: 200,
                requestData: 'not POST request',
                responseBody: 'I am running!'
            }));
        });
        it('should forward POST request', async () => {
            const postData = {
                a: 1,
                b: 2
            };
            const responseBody = await request(app.callback())
                .post('/api/rewrite')
                .query({
                    url: host + '/api/testxhr',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .send(postData)
                .expect((res) => {
                    expect(res.body.data.requestData).toEqual(postData);
                })
                .then((res) => res.body);

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: false,
                method: 'POST',
                host: 'parrotmocker.leanapp.cn',
                pathname: '/api/testxhr',
                url: host + '/api/testxhr'
            }));
            expect(app.mockSocket.emit).nthCalledWith(2, Message.MSG_REQUEST_END, expect.objectContaining({
                status: 200,
                requestData: postData,
                responseBody
            }));
        });
        it('should forward jsonp request', async () => {
            const expectedData = {
                code: 200,
                msg: 'good jsonp'
            };
            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: host + '/api/testjsonp?callback=jsonp_cb',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid'),
                    reqtype: 'jsonp'
                })
                .expect(`jsonp_cb(${JSON.stringify(expectedData)})`);

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: false,
                method: 'GET',
                host: 'parrotmocker.leanapp.cn',
                pathname: '/api/testjsonp',
                url: host + '/api/testjsonp?callback=jsonp_cb'
            }));
            expect(app.mockSocket.emit).nthCalledWith(2, Message.MSG_REQUEST_END, expect.objectContaining({
                status: 200,
                requestData: 'not POST request',
                responseBody: expectedData
            }));
        });
    });
    describe('mock', () => {
        it('should mock if matched by path', () => {
        });
        it('should mock if matched by path and pathtype=regexp', () => {
        });
        it('should mock when host is set', () => {
        });
        it('should mock when prepath is set', () => {
        });
        it('should mock when delay is set', () => {
        });
    });
});
