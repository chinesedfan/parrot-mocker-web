'use strict';

const request = require('supertest');

describe('/api/testxhr', () => {
    const app = global.app;

    it('should handle GET request', async () => {
        const {method, requestData} = await request(app.callback())
            .get('/api/testxhr')
            .query({
                a: 1,
                b: 2
            })
            .then((res) => res.body.data);

        expect(method).toEqual('GET');
        expect(requestData).toEqual({
            a: '1', // converted to string
            b: '2'
        });
    });
    it('should handle POST request', async () => {
        const {method, requestData} = await request(app.callback())
            .post('/api/testxhr')
            .send({
                a: 1,
                b: 2
            })
            .then((res) => res.body.data);

        expect(method).toEqual('POST');
        expect(requestData).toEqual({
            a: 1,
            b: 2
        });
    });
    it('should handle large json POST request', async () => {
        // For co-body, limit for json data is 1mb, but we should leave some spaces for headers
        const kb = 1023;
        const postData = {
            payload: Array(kb * 1024 / 4).fill('a')
        };
        const {method, requestData} = await request(app.callback())
            .post('/api/testxhr')
            .send(postData)
            .then((res) => res.body.data);

        expect(method).toEqual('POST');
        expect(requestData).toEqual(postData);
    });
    it('should handle large form POST request', async () => {
        // For co-body, limit for form data is 56kb, but we should leave some spaces for headers
        const kb = 55;
        const postData = {
            payload: Array(kb * 1024).fill('a').join('')
        };
        const {method, requestData} = await request(app.callback())
            .post('/api/testxhr')
            .type('form')
            .send(postData)
            .then((res) => res.body.data);

        expect(method).toEqual('POST');
        expect(requestData).toEqual(postData);
    });
});
