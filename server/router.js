'use strict';

const path = require('path');
const send = require('koa-send');
const router = require('koa-router')();
const Debug = require('debug');
const cookie = require('../common/cookie');

// api
router.register('/:prefix(/?api)/:api', ['get', 'post'], function*(next) {
    const needDebug = this.cookies.get(cookie.KEY_DEBUG);
    if (needDebug) {
        Debug.enable('parrot-mocker:*');
    } else {
        Debug.disable();
    }

    const debug = Debug('parrot-mocker:router');
    try {
        debug('enter router:', this.path);
        yield require('.' + this.path).call(this, next);
    } catch (e) {
        console.log(e.stack);
    }
});
// img
router.get('/img/:file', function*(next) {
    yield send(this, this.params.file, {
        root: path.resolve(__dirname, '../web/img')
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
