'use strict';

module.exports = function(server) {
    const io = require('socket.io')(server);
    io.on('connection', onConnection);
};

function onConnection(client) {
    console.log('connected...');

    client.on('disconnect', function() {
        console.log(`...disconnect!`);
    });
}
