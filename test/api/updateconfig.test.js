'use strict';

const request = require('supertest');
const {KEY_CLIENT_ID, generateCookieItem} = require('../../common/cookie.js');

describe('/api/updateconfig', () => {
    const app = global.app;

    it('should ingore if no client id', () => {
        return request(app.callback())
            .post('/api/updateconfig')
            .expect((res) => {
                expect(res.body).toMatchObject({
                    code: 500
                });
            });
    });
    it('should support large data', () => {
        // we have changed the form limit to 1mb
        const kb = 1023;
        const postData = [{
            payload: Array(kb * 1024).fill('a').join('')
        }];
        return request(app.callback())
            .post('/api/updateconfig')
            .set('cookie', generateCookieItem(KEY_CLIENT_ID, 'clientid'))
            .type('form')
            .send({
                jsonstr: JSON.stringify(postData)
            })
            .expect((res) => {
                expect(res.body).toMatchObject({
                    code: 200
                });
            });
    });
    it('should throw an error if not array', () => {
        return request(app.callback())
            .post('/api/updateconfig')
            .set('cookie', generateCookieItem(KEY_CLIENT_ID, 'clientid'))
            .send({
                jsonstr: '{"test": "not array"}'
            })
            .expect((res) => {
                expect(res.body).toMatchObject({
                    code: 500
                });
            });
    });
});
