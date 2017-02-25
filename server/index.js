'use strict';

const http = require('http');
const co = require('co');
const app = require('koa')();
const bodyParser = require('koa-bodyparser');
const fetch = require('./fetch.js');
const io = require('./io.js');
const router = require('./router.js');

const port = 8888;

co(function*() {
    app.use(fetch);
    app.use(bodyParser());
    app.use(router.routes());

    const server = http.createServer(app.callback());
    app.io = io(server);
    server.listen(port);

    console.log(`running at port ${port}...`);
}).catch((e) => {
    console.log(e.stack);
    process.exit(1);
});
