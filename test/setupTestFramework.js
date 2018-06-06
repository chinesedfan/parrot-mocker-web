const koa = require('koa');
const kcors = require('kcors');
const fetchMiddleware = require('../server/fetch.js');
const updateconfig = require('../server/api/updateconfig.js');
const rewrite = require('../server/api/rewrite.js');

init();

function prepareMiddlewares(app) {
    app.use(fetchMiddleware);
    app.use(kcors({
        credentials: true
    }));
    app.use(function*(next) {
        const path = this.path;
        if (path === '/api/updateconfig') {
            yield* updateconfig.call(this, next);
        } else if (path === '/api/rewrite'){
            yield* rewrite.call(this, next);
        }
    });
}
function prepareSocketIO(app) {
    const socket = {
        emit: jest.fn()
    };
    const io = {
        sockets: {
            in: jest.fn().mockReturnValue(socket)
        }
    };

    app.io = io;
    app.mockSocket = socket; // for testing
}
function init() {
    global.app = koa();
    prepareMiddlewares(app);
    prepareSocketIO(app);

    jest.setTimeout(global.retryLimit * 5000);
}
