'use strict';

const request = require('supertest');
const Message = require('../../common/message.js');

describe('/api/pushmsg', () => {
    const app = global.app;

    beforeEach(() => {
        app.mockSocket.emit.mockClear();
    });
    it('should ignore if no client id', async () => {
        const body = await request(app.callback())
            .post('/api/pushmsg') // must be POST with some data
            .send({})
            .then((res) => res.body);

        expect(body).toEqual({
            code: 500,
            msg: 'no clientID, ignored'
        });
    });
    it('should handle pushing GET message', async () => {
        const body = await request(app.callback())
            .post('/api/pushmsg')
            .send({
                clientID: 'test-user',
                //
                url: 'https://test.com/path/test?a=1',
                method: 'GET',
                requestHeaders: {
                    accept: '*/*'
                },
                //
                status: 200,
                responseHeaders: {
                    'Access-Control-Allow-Origin': '*'
                },
                responseBody: {
                    code: 200,
                    msg: 'hello world'
                },
                timestamp: '16:17:18',
                timecost: 23
            })
            .then((res) => res.body);

        expect(body).toEqual({
            code: 200,
            msg: 'good push'
        });
        expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
        expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
            isMock: false,
            method: 'GET',
            host: 'test.com',
            pathname: '/path/test',
            url: 'https://test.com/path/test?a=1'
        }));
        expect(app.mockSocket.emit).nthCalledWith(2, Message.MSG_REQUEST_END, expect.objectContaining({
            status: 200,
            timecost: 23,
            requestHeaders: {
                accept: '*/*'
            },
            requestData: 'not POST request',
            responseHeaders: {
                'Access-Control-Allow-Origin': '*'
            },
            responseBody: {
                code: 200,
                msg: 'hello world'
            }
        }));
    });
    it('should handle pushing POST message', async () => {
        const body = await request(app.callback())
            .post('/api/pushmsg')
            .send({
                clientID: 'test-user',
                //
                url: 'https://test.com/path/test?a=1',
                method: 'POST',
                requestData: {
                    postdata: 1
                },
                requestHeaders: {
                    accept: '*/*'
                },
                //
                status: 200,
                responseHeaders: {
                    'Access-Control-Allow-Origin': '*'
                },
                responseBody: {
                    code: 200,
                    msg: 'hello world'
                },
                timestamp: '16:17:18',
                timecost: 23
            })
            .then((res) => res.body);

        expect(body).toEqual({
            code: 200,
            msg: 'good push'
        });
        expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
        expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
            isMock: false,
            method: 'POST',
            host: 'test.com',
            pathname: '/path/test',
            url: 'https://test.com/path/test?a=1'
        }));
        expect(app.mockSocket.emit).nthCalledWith(2, Message.MSG_REQUEST_END, expect.objectContaining({
            status: 200,
            timecost: 23,
            requestHeaders: {
                accept: '*/*'
            },
            requestData: {
                postdata: 1
            },
            responseHeaders: {
                'Access-Control-Allow-Origin': '*'
            },
            responseBody: {
                code: 200,
                msg: 'hello world'
            }
        }));
    });
});
