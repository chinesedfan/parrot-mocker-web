'use strict';

/**
 * Additional custom options are supported (for simplify, they are required)
 *
 * @param {Function} options.handleRedirect - the only callback argument is `string`, which is the redirected url
 * @param {Function} options.handleRes - the callback argument is `http.IncomingMessage`, which is Node.js original response
 */
const fetch = require('./lib/node-fetch');

module.exports = function*(next) {
    this.fetch = fetch;

    yield* next;
};
