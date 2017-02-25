'use strict';

const fetch = require('node-fetch');

module.exports = function*(next) {
    this.fetch = fetch;

    yield* next;
};
