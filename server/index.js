'use strict';

const http = require('http');
const co = require('co');
const koa = require('koa');
const koaMount = require('koa-mount');
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const fetch = require('./fetch.js');
const io = require('./io.js');
const router = require('./router.js');

const port = process.env.PORT || 8888;
const jsoneditor = koa();
const app = koa();

co(function*() {
    jsoneditor.use(koaStatic('./node_modules/jsoneditor.webapp'));

    app.use(fetch);
    app.use(bodyParser());
    app.use(koaMount('/dist/jsoneditor.webapp', jsoneditor));
    app.use(router.routes());

    const server = http.createServer(app.callback());
    app.io = io(server);
    server.listen(port, '0.0.0.0'); // IPv4 model

    console.log(`running at port ${port}...`);
}).catch((e) => {
    console.log(e.stack);
    process.exit(1);
});
