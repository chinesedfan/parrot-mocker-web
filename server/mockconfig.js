'use strict';

const _ = require('lodash');
const qs = require('qs');
const configPool = {};

exports.getConfig = function(clientID, parsed) {
    const configList = configPool[clientID];
    if (!parsed) return configList;

    // if the parsed url object is specified, filter by its pathname
    return _(configList || []).filter((cfg) => {
        switch (cfg.pathtype) {
        case 'regexp':
            return new RegExp(cfg.path).test(parsed.pathname);
        case 'equal':
        default:
            return cfg.path === parsed.pathname;
        }
    // and its query
    }).find((cfg) => {
        if (!cfg.params) return true;

        try {
            let isOK = true;
            _.each(qs.parse(cfg.params), (v, k) => {
                if (parsed.query[k] !== v) isOK = false;
            });
            return isOK;
        } catch (e) {
            /* istanbul ignore next */
            return false;
        }
    });
};

exports.setConfig = function(clientID, cfg) {
    /* istanbul ignore if */
    if (!clientID) return;

    configPool[clientID] = cfg;
};
