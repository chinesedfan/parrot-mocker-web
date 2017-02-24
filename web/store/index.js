'use strict';

const types = {
    ADD_RECORD: 'index/add-record'
};
export {types};

export const opts = {
    state: {
        records: []
    },
    mutations: {
        [types.ADD_RECORD](state, record) {
            state.records.push(record);
        }
    }
};
