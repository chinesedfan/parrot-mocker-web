'use strict';

import './qrcode.less';
import Vue from 'vue';

import qrcode from 'vue2-qrcode/src/qrcode.vue';

new Vue({
    el: '#vue-container',
    components: {
        qrcode
    },
    data() {
        return {
            url: 'https://www.dianping.com',
            size: 500
        };
    },
    methods: {
        onInput(e) {
            const url = e.currentTarget.value;
            if (!url) return;

            this.url = url;
        }
    }
});
