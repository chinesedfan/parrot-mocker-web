'use strict';

import {KEY_CLIENT_ID, getCookieItem} from '../../common/cookie.js';

const types = {
    ADD_RECORD: 'index/add-record'
};
export {types};

export const opts = {
    state: {
        clientID: getCookieItem(document.cookie, KEY_CLIENT_ID),
        records: []
    },
    mutations: {
        [types.ADD_RECORD](state, record) {
            state.records.push(record);
        }
    }
};
