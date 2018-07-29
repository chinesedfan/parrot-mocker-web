'use strict';

const url = require('url');
const bodyParser = require('co-body');

module.exports = function*(next) {
    const debug = require('debug')('parrot-mocker:testredirect');

    if (this.request.method.toUpperCase() === 'POST') {
        this.request.body = yield bodyParser(this.req);
    } else {
        this.request.body = this.query;
    }

    debug('before this.redirect');
    this.redirect(url.format({
        pathname: '/api/testxhr',
        query: this.request.body
    }));
};
