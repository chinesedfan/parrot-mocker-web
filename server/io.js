'use strict';

module.exports = function(server) {
    const io = require('socket.io')(server);
    io.on('connection', onConnection);
    return io;
};

function onConnection(socket) {
    console.log('connected...');

    socket.on('disconnect', function() {
        console.log(`...disconnect!`);
    });
}
