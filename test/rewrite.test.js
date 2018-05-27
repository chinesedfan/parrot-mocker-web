'use strict';

const request = require('supertest');
const koa = require('koa');
const kcors = require('kcors');
const fetch = require('../server/fetch.js');
const updateconfig = require('../server/api/updateconfig.js');
const rewrite = require('../server/api/rewrite.js');

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
        });
        it('should forward POST request', () => {
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
