'use strict';

const _ = require('lodash');
const configPool = {};

exports.getConfig = function(clientID, pathname) {
    const configList = configPool[clientID];
    if (!pathname) return configList;

    // if pathname is specified, filter by it
    return _.find(configList || [], (cfg) => cfg.path === pathname);
};

exports.setConfig = function(clientID, cfg) {
    if (!clientID) return;

    configPool[clientID] = cfg;
};
