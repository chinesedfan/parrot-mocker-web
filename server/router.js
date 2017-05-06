'use strict';

const path = require('path');
const send = require('koa-send');
const router = require('koa-router')();

// api
router.register('/api/:api', ['get', 'post'], function*(next) {
    yield require('.' + this.path).call(this, next);
});
// static files
router.get('/dist/:file', function*(next) {
    yield send(this, this.params.file, {
        root: path.resolve(__dirname, '../dist')
    });
});
// pages
router.get('/html/:file', function*(next) {
    yield send(this, this.params.file, {
        root: path.resolve(__dirname, '../web/pages')
    });
});
router.get('/', function*(next) {
    yield send(this, 'index.html', {
        root: path.resolve(__dirname, '../web/pages')
    });
});

module.exports = router;
