'use strict';

module.exports = function*(next) {
    // TODO: check the mock config to determine whether request or mock
    // console.log(this.query.url, this.query.cookie, this.query.reqtype);

    this.app.io.emit('mock-request-start', {
        request: this.request,
        timestamp: getNowInHHMMSS()
    });

    this.body = 'rewrite success!';
};

function getNowInHHMMSS() {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()].map(function(v) {
        return v < 10 ? '0' + v : v;
    }).join(':');
}
