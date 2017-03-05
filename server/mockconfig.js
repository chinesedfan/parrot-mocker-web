'use strict';

const configPool = {};

exports.getConfig = function(clientID) {
    return configPool[clientID];
};

exports.setConfig = function(clientID, cfg) {
    if (!clientID) return;

    configPool[clientID] = cfg;
};
