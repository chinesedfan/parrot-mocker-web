'use strict';

import './index.less';
import Vue from 'vue';

import IndexTopBar from '../component/indextopbar';
import ReqList from '../component/reqlist';
import RspInspector from '../component/rspinspector';

new Vue({
    el: '#vue-container',
    components: {
        'index-topbar': IndexTopBar,
        'req-list': ReqList,
        'rsp-inspector': RspInspector
    }
});
