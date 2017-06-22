'use strict';

import _ from 'lodash';
import {KEY_CLIENT_ID, getCookieItem} from '../../common/cookie.js';

const types = {
    CLEAR_RECORDS: 'index/clear-records',
    ADD_RECORD: 'index/add-record',
    MERGE_RECORD: 'index/merge-record',
    UPDATE_SELECTED_RECORD: 'index/update-selected-record'
};
export {types};

function getClientID() {
    let clientID = getCookieItem(document.cookie, KEY_CLIENT_ID);
    if (clientID) return clientID;

    const chs = [];
    for (let i = 0; i < 8; i++) {
        chs.push(getRandomLetter());
    }
    clientID = chs.join('');

    document.cookie = `${KEY_CLIENT_ID}=${clientID}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    return clientID;
}
function getRandomLetter() {
    const code = Math.floor(97 + Math.random() * 26);
    return String.fromCharCode(code);
}

export const opts = {
    state: {
        clientID: getClientID(),
        records: [],
        selectedRecord: null
    },
    mutations: {
        [types.CLEAR_RECORDS](state) {
            state.records = [];
        },
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
        },
        [types.UPDATE_SELECTED_RECORD](state, record) {
            state.selectedRecord = record;
        }
    }
};
