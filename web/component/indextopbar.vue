<template>
    <div class="container">
        <ul class="left">
            <li class="client-id">{{ `clientID: ${clientID}` }}</li>
            <li @click="jumpToMockConfig">Config</li>
            <li @click="jumpToQrcode">QRCode</li>
            <li @click="clearRecords">Clear</li>
        </ul>
        <ul class="right">
            <li @click="addToMockConfig">Add</li>
        </ul>
    </div>
</template>
<script>
'use strict';

import qs from 'qs';
import url from 'url';
import {Message} from 'element-ui';
import {LS_CONFIG_CURRENT, LS_CONFIG_NAME} from '../localstorage.js';
import {types} from '../store/index';

const showNotification = (message) => Message({message, type: 'success'});
const showError = (message) => Message({message, type: 'error'});

export default {
    computed: {
        clientID() {
            return this.$store.state.clientID;
        }
    },
    methods: {
        jumpToMockConfig() {
            window.open('/html/mockconfig.html', '_blank');
        },
        jumpToQrcode() {
            window.open('/html/qrcode.html', '_blank');
        },
        clearRecords() {
            this.$store.commit(types.CLEAR_RECORDS);
        },
        addToMockConfig() {
            const selectedRecord = this.$store.state.selectedRecord;
            if (!selectedRecord) return;

            let configList;
            try {
                configList = JSON.parse(localStorage.getItem(LS_CONFIG_CURRENT)) || [];
            } catch (e) {
                configList = [];
            }

            const parsed = url.parse(decodeURIComponent(selectedRecord.url), true, true);
            _.remove(configList, (cfg) => cfg.path == parsed.pathname);
            configList.unshift({
                path: parsed.pathname,
                status: selectedRecord.status,
                response: selectedRecord.responseBody
            });
            this.applyConfig(configList);
        },

        applyConfig(configList) {
            const jsonstr = JSON.stringify(configList);

            localStorage.removeItem(LS_CONFIG_NAME);
            localStorage.setItem(LS_CONFIG_CURRENT, jsonstr);
            fetch('/api/updateconfig', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: qs.stringify({
                    jsonstr
                })
            }).then((res) => {
                if (!res || res.status != 200 || !res.ok) throw new Error('bad response');
                return res.json();
            }).then((json) => {
                if (!json || json.code != 200) {
                    throw new Error((json && json.msg) || 'unknow reason');
                }
            
                showNotification('Succeed to config!');
            }).catch((e) => {
                showError(`Failed to config: ${e.message}`);
            });
        }
    }
};
</script>
<style lang="less" scoped>
.container {
    position: relative;
    padding: 0px 15px;
    color: white;
    background-color: #4d4d4d;

    .left {
        position: absolute;
        top: 5px;
        left: 15px;
        overflow: hidden;
        line-height: 24px;
    }
    .right {
        position: absolute;
        top: 5px;
        right: 15px;
        overflow: hidden;
    }
    li {
        list-style: none;
        float: left;
        padding: 0 10px;
        line-height: 30px;
        color: #e6e6e6;
        border-right: 1px solid #737373;

        &:first-child {
            border-left: 1px solid #737373;
        }
        &:hover {
            cursor: pointer;
            background-color: #737373;
        }
    }
}
</style>