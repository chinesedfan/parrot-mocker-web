'use strict';

import './mockconfig.less';
import Vue from 'vue';

import EditorTopbar from '../component/editortopbar.vue';

new Vue({
    el: '#vue-container',
    components: {
        topbar: EditorTopbar
    }
});
