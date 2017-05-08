'use strict';

const http = require('http');
const co = require('co');
const koa = require('koa');
const kcors = require('kcors');
const koaMount = require('koa-mount');
const koaStatic = require('koa-static');
const https = require('https');
const pem = require('pem');
const fetch = require('./fetch.js');
const io = require('./io.js');
const router = require('./router.js');

const port = process.env.PORT || process.env.LEANCLOUD_APP_PORT || 8080;
const httpsPort = process.env.HTTPS_PORT || 8443;
const jsoneditor = koa();
const app = koa();

co(function*() {
    jsoneditor.use(koaStatic('./node_modules/jsoneditor.webapp'));

    app.proxy = true;

    app.use(fetch);
    app.use(kcors({
        credentials: true
    }));
    app.use(koaMount('/dist/jsoneditor.webapp', jsoneditor));
    app.use(router.routes());

    const server = http.createServer(app.callback());
    app.io = io(server);
    server.listen(port, '0.0.0.0'); // IPv4 model

    pem.createCertificate({
        days: 1,
        selfSigned: true
    }, (err, keys) => {
        const httpsServer = https.createServer({
            key: keys.serviceKey,
            cert: keys.certificate
        }, app.callback());
        app.io.attach(httpsServer);
        httpsServer.listen(httpsPort, '0.0.0.0');
    });

    console.log(`running at port http[${port}] & https[${httpsPort}]...`);
}).catch((e) => {
    console.log(e.stack);
    process.exit(1);
});
