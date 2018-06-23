const fetch = require('node-fetch');
const config = require('../jest.config.js');

const {fullHost, retryLimit} = config.globals;

function wakeupTestServer(retry) {
    console.log(`wakeupTestServer: retry=${retry}`);

    return fetch(fullHost + '/api/test')
        .catch(() => {
            if (retry) return wakeupTestServer(retry - 1);
        });
}

module.exports = function() {
    return wakeupTestServer(retryLimit);
};
