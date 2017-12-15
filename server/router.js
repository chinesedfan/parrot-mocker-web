'use strict';

const path = require('path');
const send = require('koa-send');
const router = require('koa-router')();

// api
router.register('/:prefix(/?api)/:api', ['get', 'post'], function*(next) {
    try {
        yield require('.' + this.path).call(this, next);
    } catch (e) {
        console.log(e.stack);
    }
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
