'use strict';

const _ = require('lodash');
const configPool = {};

exports.getConfig = function(clientID, parsed) {
    const configList = configPool[clientID];
    if (!parsed) return configList;

    // if the parsed url object is specified, filter by its pathname
    return _.find(configList || [], (cfg) => cfg.path === parsed.pathname);
};

exports.setConfig = function(clientID, cfg) {
    if (!clientID) return;

    configPool[clientID] = cfg;
};
