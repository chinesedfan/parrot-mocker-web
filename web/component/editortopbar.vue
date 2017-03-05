<template>
    <div id="header">
        <div class="select-wrapper">
            <div>Local Config:</div>
            <select ref="select" @change="updateConfigName">
                <option v-for="name in configNameList" :selected="name == configName">{{ name }}</option>
            </select>
        </div>
        <div id="menu">
            <ul class="left">
                <li @click="saveConfig(configName)">
                    <a>Save</a>
                </li>
                <li @click="loadConfig(configName)">
                    <a>Load</a>
                </li>
                <li @click="saveAsConfig()">
                    <a>Save As</a>
                </li>
                <li @click="deleteConfig(configName)">
                    <a>Delete</a>
                </li>
            </ul>
            <ul class="right">
                <li @click="applyConfig">
                    <a>Apply</a>
                </li>
                <li @click="clearConfig">
                    <a>Clear</a>
                </li>
                <li>
                    <a id="help" title="Open documentation (opens in a new window)" href="http://jsoneditoronline.org/doc/index.html" target="_blank">Help</a>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
'use strict';

import _ from 'lodash';
import qs from 'qs';

const LS_CONFIG_CURRENT = '__mkcfg_current';
const LS_CONFIG_NAME = '__mkcfg_name';
const LS_CONFIG_NAME_LIST = '__mkcfg_name_list';
const LS_CONFIG_PREFIX = '__mkcfg/';
const {app, codeEditor, treeEditor} = window;
const showNotification = app.notify.showNotification.bind(app.notify);
const showError = app.notify.showError.bind(app.notify);

export default {
    data() {
        return {
            configName: '',
            configNameList: []
        };
    },
    mounted() {
        this.configName = localStorage.getItem(LS_CONFIG_NAME);
        try {
            this.configNameList = JSON.parse(localStorage.getItem(LS_CONFIG_NAME_LIST)) || [];
        } catch (e) {}

        this.loadConfig(this.configName);
    },
    watch: {
        configName(val) {
            localStorage.setItem(LS_CONFIG_NAME, val);
        },
        configNameList(val) {
            localStorage.setItem(LS_CONFIG_NAME_LIST, JSON.stringify(val));
        }
    },
    methods: {
        getConfigStr() {
            return JSON.stringify(codeEditor.get());
        },

        updateConfigName() {
            const name = this.$refs.select.value;
            this.configName = name;
        },
        saveConfig(name) {
            if (!name) {
                this.saveAsConfig();
                return;
            }

            if (!confirm(`确认覆盖方案: ${name}?`)) return;
            localStorage.setItem(LS_CONFIG_PREFIX + name, this.getConfigStr());
        },
        loadConfig(name) {
            if (!name) return;

            try {
                const json = JSON.parse(localStorage.getItem(LS_CONFIG_PREFIX + name));
                codeEditor.set(json);
                treeEditor.set(json);
            } catch (e) {
                showError(`加载失败: ${e.message}`);
            }
        },
        saveAsConfig() {
            const name = prompt('配置名称');
            if (!name) return;

            const isExisted = _.some(this.configNameList, (n) => n == name);
            if (!isExisted) {
                this.configNameList.push(name);
            }

            this.configName = name;
            localStorage.setItem(LS_CONFIG_PREFIX + name, this.getConfigStr());
        },
        deleteConfig(name) {
            if (!confirm(`确认删除方案: ${name}?`)) return;

            this.configName = '';
            _.some(this.configNameList, (n, i) => {
                if (n == name) {
                    this.configNameList.splice(i, 1);
                    return true;
                }
            });

            localStorage.removeItem(LS_CONFIG_PREFIX + name);
        },
        applyConfig() {
            const jsonstr = this.getConfigStr();

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
            
                showNotification('设置成功');
            }).catch((e) => {
                showError(`设置失败: ${e.message}`);
            });
        },
        clearConfig() {
            codeEditor.set({});
            treeEditor.set({});
        }
    }
};
</script>
<style lang="less" scoped>
.select-wrapper {
    margin-left: 15px;
    padding: 10px 0 10px 90px;
    position: relative;

    div {
        position: absolute;
        top: 10px;
        left: 0;
        width: 90px;
        line-height: 20px;
    }
    select {
        width: 160px;
    }
}

#menu {
    left: 275px;

    .left {
        position: absolute;
        left: 0;
    }
    .right {
        position: absolute;
        right: 0;
    }
}
</style>