'use strict';

const qs = require('qs');
const request = require('supertest');
const {KEY_CLIENT_ID, KEY_SERVER, generateCookieItem} = require('../../common/cookie.js');
const Message = require('../../common/message.js');

const host = global.host;
const fullHost = global.fullHost;

function setMockConfig(app, clientId, jsonstr) {
    return request(app.callback())
        .post('/api/updateconfig')
        .set('cookie', generateCookieItem(KEY_CLIENT_ID, clientId))
        .send({
            jsonstr
        })
        .expect((res) => {
            expect(res.body.code).toEqual(200);
        });
}

describe('/api/rewrite', () => {
    const app = global.app;

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
                    url: fullHost + '/api/test',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect('I am running!');

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: false,
                method: 'GET',
                host,
                pathname: '/api/test',
                url: fullHost + '/api/test'
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
                    url: fullHost + '/api/testxhr',
                    cookie: [
                        generateCookieItem('testkey', 'testvalue'),
                        generateCookieItem(KEY_CLIENT_ID, 'clientid')
                    ].join('; ')
                })
                .set('origin', 'fakeorigin.com')
                .send(postData)
                .expect((res) => {
                    expect(res.headers['access-control-allow-origin']).toEqual('fakeorigin.com');
                    expect(res.headers['access-control-allow-credentials']).toEqual('true');

                    expect(res.body.data.requestData).toEqual(postData);
                })
                .then((res) => res.body);

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: false,
                method: 'POST',
                host,
                pathname: '/api/testxhr',
                url: fullHost + '/api/testxhr'
            }));
            expect(app.mockSocket.emit).nthCalledWith(2, Message.MSG_REQUEST_END, expect.objectContaining({
                status: 200,
                requestData: postData,
                responseBody
            }));

            const cookies = responseBody.data.requestHeaders.cookie;
            expect(cookies).toEqual(generateCookieItem('testkey', 'testvalue'));
        });
        it('should forward POST request with specified content-type', async () => {
            const postData = {
                a: 1, // form will lose type
                b: 2
            };

            await request(app.callback())
                .post('/api/rewrite')
                .query({
                    url: fullHost + '/api/testxhr',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .type('json') // superagent will automatically serialize and the default `type` is `json`
                .send(postData)
                .expect((res) => {
                    expect(res.body.data.requestHeaders['content-type']).toMatch('application/json');
                    expect(res.body.data.requestData).toEqual(postData);
                });

            await request(app.callback())
                .post('/api/rewrite')
                .query({
                    url: fullHost + '/api/testxhr',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .type('form')
                .send(postData) // by default sending strings will set the `Content-Type` to `application/x-www-form-urlencoded`
                .expect((res) => {
                    expect(res.body.data.requestHeaders['content-type']).toMatch('application/x-www-form-urlencoded');
                    expect(res.body.data.requestData).toEqual({
                        a: '1',
                        b: '2'
                    });
                });
        });
        it('should forward jsonp request', async () => {
            const expectedData = {
                code: 200,
                msg: 'good jsonp'
            };
            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/api/testjsonp?callback=jsonp_cb',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid'),
                    reqtype: 'jsonp'
                })
                .expect(`jsonp_cb(${JSON.stringify(expectedData)})`);

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: false,
                method: 'GET',
                host,
                pathname: '/api/testjsonp',
                url: fullHost + '/api/testjsonp?callback=jsonp_cb'
            }));
            expect(app.mockSocket.emit).nthCalledWith(2, Message.MSG_REQUEST_END, expect.objectContaining({
                status: 200,
                requestData: 'not POST request',
                responseBody: expectedData
            }));
        });
        it('should handle forward error', async () => {
            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: 'http://badhost/badpath?badquery',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect(404, 'Not Found')
                .expect((res) => res.body);

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: false,
                method: 'GET',
                host: 'badhost',
                pathname: '/badpath',
                url: 'http://badhost/badpath?badquery'
            }));
            expect(app.mockSocket.emit).nthCalledWith(2, Message.MSG_REQUEST_END, expect.objectContaining({
                status: 500,
                responseBody: expect.stringMatching(/^FetchError/)
            }));
        });
        it('should handle bad POST data', async () => {
            await setMockConfig(app, 'clientid', `[{
                "path": "/api/nonexist",
                "status": 200,
                "response": {
                    "code": 200,
                    "msg": "mock response"
                }
            }]`);

            const body = await request(app.callback())
                .post('/api/rewrite') // without data
                .query({
                    url: fullHost + '/api/nonexist?callback=jsonp_cb',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .then((res) => res.body);

            expect(body).toEqual({
                code: 200,
                msg: 'mock response'
            });
            expect(app.mockSocket.emit).nthCalledWith(2, Message.MSG_REQUEST_END, expect.objectContaining({
                requestData: 'Missing content-type' // thrown by co-body
            }));
        });
        it('should filter CloudFlare related request headers', async () => {
            const expectedData = {
                code: 200,
                msg: 'good jsonp'
            };
            await request(app.callback())
                .get('/api/rewrite')
                .set('cf-test', 'test-value')
                .set('not-filtered', 'val')
                .query({
                    url: fullHost + '/api/testjsonp?callback=jsonp_cb',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid'),
                    reqtype: 'jsonp'
                })
                .expect(`jsonp_cb(${JSON.stringify(expectedData)})`);

            const [type, data] = app.mockSocket.emit.mock.calls[1];
            expect(type).toEqual(Message.MSG_REQUEST_END);
            expect(data.requestHeaders).toEqual(expect.not.objectContaining({
                'cf-test': 'test-value'
            }));
            expect(data.requestHeaders).toEqual(expect.objectContaining({
                'not-filtered': 'val'
            }));
        });
    });
    describe('mock', () => {
        it('should mock if matched by `path` and `pathtype=equal`', async () => {
            await setMockConfig(app, 'clientid', `[{
                "path": "/api/nonexist",
                "pathtype": "equal",
                "status": 200,
                "response": {
                    "code": 200,
                    "msg": "mock response before"
                }
            }]`);

            // override
            await setMockConfig(app, 'clientid', `[{
                "path": "/api/nonexist",
                "pathtype": "equal",
                "status": 200,
                "response": {
                    "code": 200,
                    "msg": "mock response"
                }
            }]`);

            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/api/nonexist',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect((res) => {
                    expect(res.body).toEqual({
                        "code": 200,
                        "msg": "mock response"
                    });
                });
        });
        it('should mock if matched by `path` and `responsetype=mockjs`', async () => {
            await setMockConfig(app, 'clientid', `[{
                "path": "/api/nonexist",
                "status": 200,
                "responsetype": "mockjs",
                "response": {
                    "code": 200,
                    "msg|3": ["mock response"]
                }
            }]`);

            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/api/nonexist',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect((res) => {
                    expect(res.body).toEqual({
                        "code": 200,
                        "msg": Array(3).fill("mock response")
                    });
                });
        });
        it('should mock if matched by `path` and `pathtype=regexp`', async () => {
            await setMockConfig(app, 'clientid', `[{
                "path": "(bad)?nonexist",
                "pathtype": "regexp",
                "status": 200,
                "response": {
                    "code": 200,
                    "msg": "mock response"
                }
            }]`);

            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/api/nonexist',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect((res) => {
                    expect(res.body).toEqual({
                        "code": 200,
                        "msg": "mock response"
                    });
                });
        });
        it('should mock when `host` is set', async () => {
            await setMockConfig(app, 'clientid', `[{
                "host": "${host}",
                "path": "/api/test"
            }]`);

            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: 'https://bad.com/api/test',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect('I am running!');
        });
        it('should mock when `prepath` is set', async () => {
            await setMockConfig(app, 'clientid', `[{
                "host": "${host}",
                "path": "/test",
                "prepath": "/api"
            }]`);

            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/test',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect('I am running!');
        });
        it('should mock when `params` is set', async () => {
            await setMockConfig(app, 'clientid', `[{
                "path": "/api/test",
                "params": "a=1&b=2",
                "status": 200,
                "response": "I am mocking"
            }]`);

            // not match
            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/api/test?a=1',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect('I am running!');

            // match get
            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/api/test?a=1&b=2',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect('I am mocking');

            // match post
            await request(app.callback())
                .post('/api/rewrite')
                .query({
                    url: fullHost + '/api/test',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .send({
                    a: '1',
                    b: '2'
                })
                .expect('I am mocking');
        });
        it('should mock when `callback` is set', async () => {
            const expectedData = JSON.stringify({
                code: 200,
                msg: 'wrap me!'
            });
            await setMockConfig(app, 'clientid', `[{
                "path": "/api/nonexist",
                "status": 200,
                "callback": "jsonp",
                "response": ${expectedData}
            }]`);

            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/api/nonexist?jsonp=jsonp_cb',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid'),
                    reqtype: 'jsonp'
                })
                .expect(`jsonp_cb(${expectedData})`);
        });
        it('should mock when `status` is set', async () => {
            await setMockConfig(app, 'clientid', `[{
                "path": "/api/nonexist",
                "status": 501,
                "response": {
                    "code": 200,
                    "msg": "mock response"
                }
            }]`);

            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/api/nonexist',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect(501);
        });
        it('should mock when `delay` is set', async () => {
            await setMockConfig(app, 'clientid', `[{
                "delay": 3000,
                "path": "/api/nonexist",
                "status": 200,
                "response": {
                    "code": 200,
                    "msg": "mock response"
                }
            }]`);

            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/api/nonexist',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect((res) => {
                    expect(res.body).toEqual({
                        "code": 200,
                        "msg": "mock response"
                    });
                });

            const timecost = app.mockSocket.emit.mock.calls[1][1].timecost;
            expect(Math.floor(timecost / 1000)).toEqual(3);
        });
        it('should handle empty response', async () => {
            await setMockConfig(app, 'clientid', `[{
                "path": "/api/nonexist",
                "pathtype": "equal",
                "status": 200,
                "response": ""
            }]`);

            // nested forwarding
            const agent = request(app.callback())
                .get('/api/rewrite');
            const url = agent.url + '?' + qs.stringify({
                url: fullHost + '/api/nonexist',
                cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
            });

            await agent
                .query({
                    url,
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect(200, '');
        });
        it('should handle large data', async () => {
            // For co-body, limit for json data is 1mb, but we should leave some spaces for headers
            const kb = 1023;
            const postData = {
                payload: Array(kb * 1024 / 4).fill('a')
            };
            await request(app.callback())
                .post('/api/rewrite')
                .query({
                    // make sure `fullHost` points to HTTP_PORT, instead of PORT
                    url: fullHost + '/api/testxhr',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .send(postData)
                .expect((res) => {
                    expect(res.status).toEqual(200);
                    expect(res.body.data.requestData).toEqual(postData);
                });
        });
        it('should handle redirecting', async () => {
            const postData = {
                a: '1', // query will convert everything into string
                b: '2'
            };

            const responseBody = await request(app.callback())
                .post('/api/rewrite')
                .query({
                    url: fullHost + '/api/testredirect',
                    cookie: [
                        generateCookieItem('testkey', 'testvalue'),
                        generateCookieItem(KEY_SERVER, fullHost),
                        generateCookieItem(KEY_CLIENT_ID, 'clientid')
                    ].join('; ')
                })
                .send(postData)
                .then((res) => res.body);

            const {method, requestHeaders, requestData} = responseBody.data;
            expect(method).toEqual('GET'); // redirecting POST will become GET
            expect(requestHeaders.cookie).toEqual(generateCookieItem('testkey', 'testvalue'));
            expect(requestData).toEqual(postData);
        });
        it('should handle complex jsonp content', async () => {
            const expectedData = JSON.stringify({
                code: 200,
                msg: '(a(b)c)'
            });
            await setMockConfig(app, 'clientid', `[{
                "path": "/api/nonexist",
                "status": 200,
                "response": ${expectedData}
            }]`);

            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: fullHost + '/api/nonexist?callback=jsonp_cb',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid'),
                    reqtype: 'jsonp'
                })
                .expect(`jsonp_cb(${expectedData})`);
        });
    });
    describe('not suggested', () => {
        beforeEach(async () => {
            await setMockConfig(app, 'clientid', `[{
                "path": ".",
                "pathtype": "regexp",
                "status": 200,
                "response": {
                    "code": 200,
                    "msg": "mock response"
                }
            }]`);
        });

        it('should support to set protocol', async () => {
            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: '//' + host + '/api/nonexist',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid')
                })
                .expect((res) => {
                    expect(res.body).toEqual({
                        code: 200,
                        msg: 'mock response'
                    });
                });

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: true,
                method: 'GET',
                host,
                pathname: '/api/nonexist',
                url: 'http://' + host + '/api/nonexist'
            }));
        });
        it('should support to set ip:port as host for local requests', async () => {
            const queryHost = 'local.xx.com';
            const ip = '123.123.123.123';
            await request(app.callback())
                .get('/api/rewrite')
                .set('X-Forwarded-For', ip)
                .query({
                    url: '/api/nonexist',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid'),
                    host: queryHost
                })
                .expect((res) => {
                    expect(res.body).toEqual({
                        code: 200,
                        msg: 'mock response'
                    });
                });

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: true,
                method: 'GET',
                host: `${ip}:80`,
                pathname: '/api/nonexist',
                url: `http://${ip}:80/api/nonexist`
            }));
        });
        it('should support to set ip:port as host for local requests if query specified port', async () => {
            const queryHost = 'local.xx.com:8888';
            const ip = '123.123.123.123';
            await request(app.callback())
                .get('/api/rewrite')
                .set('X-Forwarded-For', ip)
                .query({
                    url: '/api/nonexist',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid'),
                    host: queryHost
                })
                .expect((res) => {
                    expect(res.body).toEqual({
                        code: 200,
                        msg: 'mock response'
                    });
                });

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: true,
                method: 'GET',
                host: `${ip}:8888`,
                pathname: '/api/nonexist',
                url: `http://${ip}:8888/api/nonexist`
            }));
        });
        it('should support to set ip:port as host for local requests if deployed as https', async () => {
            const queryHost = 'local.xx.com';
            const ip = '123.123.123.123';
            await request(app.callback())
                .get('/api/rewrite')
                .set('X-Forwarded-For', ip)
                .set('X-Forwarded-Proto', 'https:') // hack koa context.request.protocol
                .query({
                    url: '/api/nonexist',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid'),
                    host: queryHost
                })
                .expect((res) => {
                    expect(res.body).toEqual({
                        code: 200,
                        msg: 'mock response'
                    });
                });

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: true,
                method: 'GET',
                host: `${ip}:443`,
                pathname: '/api/nonexist',
                url: `https://${ip}:443/api/nonexist`
            }));
        });
        it('should support to set host from query if not local requests', async () => {
            const queryHost = 'xx.com';
            await request(app.callback())
                .get('/api/rewrite')
                .query({
                    url: '/api/nonexist',
                    cookie: generateCookieItem(KEY_CLIENT_ID, 'clientid'),
                    host: queryHost
                })
                .expect((res) => {
                    expect(res.body).toEqual({
                        code: 200,
                        msg: 'mock response'
                    });
                });

            expect(app.mockSocket.emit).toHaveBeenCalledTimes(2);
            expect(app.mockSocket.emit).nthCalledWith(1, Message.MSG_REQUEST_START, expect.objectContaining({
                isMock: true,
                method: 'GET',
                host: queryHost,
                pathname: '/api/nonexist',
                url: 'http://' + queryHost + '/api/nonexist'
            }));
        });
    });
});
