'use strict';

const request = require('supertest');
const koa = require('koa');
const kcors = require('kcors');
const fetch = require('../server/fetch.js');
const updateconfig = require('../server/api/updateconfig.js');
const rewrite = require('../server/api/rewrite.js');
const {KEY_CLIENT_ID, generateCookieItem} = require('../common/cookie.js');
const host = 'https://parrotmocker.leanapp.cn';

function prepareMiddlewares(app) {
    app.use(fetch);
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

describe('/api/rewrite', () => {
    let app;

    beforeAll(() => {
        app = koa();
        prepareMiddlewares(app);
        prepareSocketIO(app);
    });
    describe('forward', () => {
        it('should ignore if no client id', () => {
            return request(app.callback())
                .get('/api/rewrite')
                .expect('no clientID, ignored');
        });
        it('should forward GET request', () => {
            return request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: host + '/api/test',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect('I am running!');
        });
        it('should forward POST request', () => {
            const postData = {
                a: 1,
                b: 2
            };
            return request(app.callback())
                .post('/api/rewrite')
                .query({
                    url: host + '/api/testxhr',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .send(postData)
                .expect((res) => {
                    expect(res.body.data.requestData).toEqual(postData);
                });
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
