const koa = require('koa');
const kcors = require('kcors');
const fetchMiddleware = require('../server/fetch.js');

init();

function prepareMiddlewares(app) {
    app.use(fetchMiddleware);
    app.use(kcors({
        credentials: true
    }));
    app.use(function*(next) {
        const api = require('../server' + this.path);
        try {
            yield api.call(this, next);
        } catch (e) {
            /* istanbul ignore next */
            console.error(e.stack);
        }
    });

    app.proxy = true; // trust proxy related headers, i.e. X-Forwarded-For
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
