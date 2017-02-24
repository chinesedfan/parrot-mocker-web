'use strict';

import './index.less';
import Vue from 'vue';
import Vuex from 'vuex';

import IndexTopBar from '../component/indextopbar';
import ReqList from '../component/reqlist';
import RspInspector from '../component/rspinspector';
import {types, opts} from '../store/index';

Vue.use(Vuex);
const store = new Vuex.Store(opts);
new Vue({
    el: '#vue-container',
    store,
    components: {
        'index-topbar': IndexTopBar,
        'req-list': ReqList,
        'rsp-inspector': RspInspector
    }
});

const socket = io.connect('http://localhost:8888');
socket.on('connect', function() {
    console.log('connected!');
});
socket.on('mock-request-start', function(record) {
    store.commit(types.ADD_RECORD, record);
});
