'use strict';

const _ = require('lodash');
const bodyParser = require('co-body');
const Cookie = require('../../common/cookie');
const MockConfig = require('../mockconfig.js');

module.exports = function*(next) {
    const clientID = Cookie.getCookieItem(this.request.headers.cookie, Cookie.KEY_CLIENT_ID);
    if (!clientID) {
        this.body = {
            code: 500,
            msg: 'no clientID, ignored'
        };
        return;
    }

    try {
        this.request.body = yield bodyParser(this.req, {
            limit: '1mb'
        });

        const json = JSON.parse(this.request.body.jsonstr);
        if (!_.isArray(json)) throw new Error('mock config must be an array');
        MockConfig.setConfig(clientID, json);

        this.body = {
            code: 200,
            msg: `${clientID}: updateconfig success!`
        };
    } catch (e) {
        this.body = {
            code: 500,
            msg: `${clientID}: ${e.message}!`
        };
    }
};
