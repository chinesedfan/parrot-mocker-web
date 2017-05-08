'use strict';

const Cookie = require('../common/cookie');
const ioServer = require('socket.io');

module.exports = function(server) {
    const io = new ioServer()
    io.on('connection', onConnection);
    if (server) {
      io.attach(server)
    }
    return io;
};

function onConnection(socket) {
    console.log(`[${socket.id}]connected...`);

    const clientID = Cookie.getCookieItem(socket.request.headers.cookie, Cookie.KEY_CLIENT_ID);
    if (!clientID) {
        console.log(`[${socket.id}]...no clientID to join`);
        return;
    }

    socket.join(clientID);
    console.log(`[${socket.id}]...join ${clientID}`);

    socket.on('disconnect', function() {
        socket.leave(clientID);
        console.log(`[${socket.id}]...disconnect!`);
    });
}
