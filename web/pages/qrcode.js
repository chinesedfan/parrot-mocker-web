'use strict';

import './qrcode.less';
import Vue from 'vue';

import qrcode from 'vue2-qrcode/src/qrcode.vue';
import {KEY_CLIENT_ID, getCookieItem} from '../../common/cookie.js';
import * as UrlParams from '../../common/urlparams.js';

import url from 'url';

new Vue({
    el: '#vue-container',
    components: {
        qrcode
    },
    data() {
        return {
            url: 'https://www.dianping.com',
            size: 500,
            clientID: getCookieItem(document.cookie, KEY_CLIENT_ID)
        };
    },
    methods: {
        onInput(e) {
            const val = e.currentTarget.value;
            if (!val) return;

            const parsed = url.parse(val, true, true);
            parsed.search = ''; // must clear
            parsed.query = {
                [UrlParams.URL_PARAM_MOCK]: 1,
                [UrlParams.URL_PARAM_HOST]: location.protocol + '//' + location.host,
                [UrlParams.URL_PARAM_CLIENT_ID]: this.clientID,
                ...parsed.query
            };
            this.url = url.format(parsed);
        },
        onQrcodeClicked() {
            window.open(this.url, '_blank');
        }
    }
});
