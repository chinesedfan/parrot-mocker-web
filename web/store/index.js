'use strict';

import Cookie from 'tiny-cookie';
import {CLIENT_ID} from '../../constants/cookie.js';

const types = {
    ADD_RECORD: 'index/add-record'
};
export {types};

export const opts = {
    state: {
        clientID: Cookie.get(CLIENT_ID),
        records: []
    },
    mutations: {
        [types.ADD_RECORD](state, record) {
            state.records.push(record);
        }
    }
};
