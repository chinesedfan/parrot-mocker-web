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
});
