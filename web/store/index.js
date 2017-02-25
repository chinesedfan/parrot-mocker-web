'use strict';

import _ from 'lodash';
import {KEY_CLIENT_ID, getCookieItem} from '../../common/cookie.js';

const types = {
    ADD_RECORD: 'index/add-record',
    MERGE_RECORD: 'index/merge-record'
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
        },
        [types.MERGE_RECORD](state, record) {
            _.some(state.records, (r, i) => {
                if (r.id == record.id) {
                    _.extend(r, record);
                    state.records.splice(i, 1, r);
                    return true;
                }
            });
        }
    }
};
