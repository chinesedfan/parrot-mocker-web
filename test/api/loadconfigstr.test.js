'use strict';

const request = require('supertest');
const {KEY_CLIENT_ID, generateCookieItem} = require('../../common/cookie.js');

describe('/api/loadconfigstr', () => {
    const app = global.app;

    it('should ingore if no client id', () => {
        return request(app.callback())
            .post('/api/loadconfigstr')
            .expect((res) => {
                expect(res.body).toMatchObject({
                    code: 500
                });
            });
    });
    it('should able to load data', async () => {
        const jsonstr = JSON.stringify([{
            "path": "/api/nonexist",
            "pathtype": "equal",
            "status": 200,
            "response": {
                "code": 200,
                "msg": "mock response"
            }
        }]);
        await request(app.callback())
            .post('/api/updateconfig')
            .set('cookie', generateCookieItem(KEY_CLIENT_ID, 'clientid'))
            .type('form')
            .send({
                jsonstr
            })
            .expect((res) => {
                expect(res.body).toMatchObject({
                    code: 200
                });
            });

        await request(app.callback())
            .post('/api/loadconfigstr')
            .set('cookie', generateCookieItem(KEY_CLIENT_ID, 'clientid'))
            .expect((res) => {
                expect(res.body.msg).toEqual(jsonstr);
            });
    });
});
