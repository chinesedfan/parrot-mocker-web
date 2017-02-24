'use strict';

const co = require('co');
const app = require('koa')();
const router = require('./router.js');

const port = 8888;

co(function*() {
    app.use(router.routes());
    app.listen(port);

    console.log(`running at port ${port}...`);
}).catch((e) => {
    console.log(e.stack);
    process.exit(1);
});
