'use strict';

const net = require('net');
const http = require('http');
const https = require('https');
const co = require('co');
const koa = require('koa');
const kcors = require('kcors');
const koaMount = require('koa-mount');
const koaStatic = require('koa-static');
const pem = require('pem');
const fetch = require('./fetch.js');
const io = require('./io.js');
const router = require('./router.js');

const port = process.env.PORT || process.env.LEANCLOUD_APP_PORT || 8080;
const httpPort = process.env.HTTP_PORT || 8442;
const httpsPort = process.env.HTTPS_PORT || 8443;

const app = koa();
const appDist = koa();
const appEditor = koa();

co(function*() {
    appDist.use(koaStatic('./dist'));
    appEditor.use(koaStatic('./node_modules/jsoneditor.webapp'));

    app.proxy = true;
    app.io = io();

    app.use(fetch);
    app.use(kcors({
        credentials: true
    }));
    app.use(koaMount('/dist/jsoneditor.webapp', appEditor));
    app.use(koaMount('/dist', appDist));
    app.use(router.routes());

    // http
    const httpServer = http.createServer(app.callback());
    httpServer.listen(httpPort, '0.0.0.0'); // IPv4 model
    app.io.attach(httpServer);
    console.log(`running HTTP server at port ${httpPort}...`);

    // https
    const keys = yield (cb) => pem.createCertificate({
        days: 1,
        selfSigned: true
    }, cb);
    const httpsServer = https.createServer({
        key: keys.serviceKey,
        cert: keys.certificate
    }, app.callback());
    app.io.attach(httpsServer);
    httpsServer.listen(httpsPort, '0.0.0.0');
    console.log(`running HTTPS server at port ${httpsPort}...`);

    // proxy port
    const server = net.createServer((socket) => {
        socket.once('data', (buffer) => {
            const realPort = buffer[0] == 0x16 ? httpsPort : httpPort;
            const proxy = net.createConnection(realPort, () => {
                proxy.write(buffer);
                socket.pipe(proxy).pipe(socket);
            });

            proxy.on('error', (err) => {
                console.log(err.stack);
            });
        });
        socket.on('error', (err) => {
            console.log(err.stack);
        });
    });
    server.listen(port, '0.0.0.0');
    console.log(`running at port ${port}...`);
}).catch((e) => {
    console.log(e.stack);
    process.exit(1);
});
