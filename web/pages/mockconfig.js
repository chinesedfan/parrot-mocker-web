'use strict';

import './mockconfig.less';
import Vue from 'vue';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';

import EditorTopbar from '../component/editortopbar.vue';

locale.use(lang);

new Vue({
    el: '#vue-container',
    components: {
        topbar: EditorTopbar
    }
});
