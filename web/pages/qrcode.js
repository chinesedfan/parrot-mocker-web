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
            val: 'https://www.dianping.com',
            url: 'https://www.dianping.com',
            size: 500,
            clientID: getCookieItem(document.cookie, KEY_CLIENT_ID),
            // options
            isReset: false
        };
    },
    methods: {
        onInput(e) {
            this.val = e.currentTarget.value;
            this.updateUrl();
        },
        onResetClicked() {
            this.isReset = !this.isReset;
            this.updateUrl();
        },
        onQrcodeClicked() {
            window.open(this.url, '_blank');
        },

        updateUrl() {
            if (!this.val) return;

            const parsed = url.parse(this.val, true, true);
            parsed.search = ''; // must clear
            parsed.query = {
                ...this.getExtraParams(),
                ...parsed.query
            };
            this.url = url.format(parsed);
        },
        getExtraParams() {
            const params = {
                [UrlParams.URL_PARAM_MOCK]: this.isReset ? '0' : '1'
            };

            if (!this.isReset) {
                params[UrlParams.URL_PARAM_HOST] = location.protocol + '//' + location.host;
                params[UrlParams.URL_PARAM_CLIENT_ID] = this.clientID;
            }
            return params;
        }
    }
});
