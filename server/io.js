'use strict';

const Cookie = require('../common/cookie');

module.exports = function(server) {
    const io = require('socket.io')(server);
    io.on('connection', onConnection);
    return io;
};

function onConnection(socket) {
    console.log(`[${socket.id}]connected...`);

    socket.on('disconnect', function() {
        console.log(`[${socket.id}]...disconnect!`);
    });

    const clientID = Cookie.getCookieItem(socket.request.headers.cookie, Cookie.KEY_CLIENT_ID);
    if (!clientID) {
        console.log(`[${socket.id}]...no clientID to join`);
        return;
    }

    socket.join(clientID);
    console.log(`[${socket.id}]...join ${clientID}`);
}
