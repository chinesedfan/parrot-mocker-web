'use strict';

const path = require('path');
const send = require('koa-send');
const router = require('koa-router')();

router.get('/', function*(next) {
    yield send(this, 'index.html', {
        root: path.resolve(__dirname, '../web/pages')
    });
});

module.exports = router;
