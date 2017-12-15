<template>
    <div id="header">
        <div class="select-wrapper">
            <div>Local Config:</div>
            <select ref="select" v-model="configName">
                <option disabled value="">Please select one</option>
                <option v-for="name in configNameList" :selected="name === configName">{{ name }}</option>
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
import {Message, MessageBox} from 'element-ui';
import {LS_CONFIG_CURRENT, LS_CONFIG_NAME, LS_CONFIG_NAME_LIST, LS_CONFIG_PREFIX} from '../localstorage.js';

const {app, codeEditor, treeEditor} = window;
const showNotification = (message) => Message({message, type: 'success'});
const showError = (message) => Message({message, type: 'error'});

export default {
    data() {
        return {
            configName: '',
            configNameList: []
        };
    },
    mounted() {
        this.configName = localStorage.getItem(LS_CONFIG_NAME) || '';
        try {
            this.configNameList = JSON.parse(localStorage.getItem(LS_CONFIG_NAME_LIST)) || [];
        } catch (e) {}

        this.loadConfigStr().then((serverStr) => {
            const localStr = localStorage.getItem(LS_CONFIG_CURRENT);
            if (localStr != serverStr) {
                this.configName = '';
                localStorage.removeItem(LS_CONFIG_NAME);
                localStorage.setItem(LS_CONFIG_CURRENT, serverStr);
            }

            const json = JSON.parse(serverStr);
            codeEditor.set(json);
            treeEditor.set(json);
        }).catch(() => {
            showError('Failed to sync configstr from the server');
        });
    },
    watch: {
        configNameList(val) {
            if (!_.isEmpty(val)) {
                localStorage.setItem(LS_CONFIG_NAME_LIST, JSON.stringify(val));
            } else {
                localStorage.removeItem(LS_CONFIG_NAME_LIST);
            }
        }
    },
    methods: {
        getConfigStr() {
            return JSON.stringify(codeEditor.get() || []);
        },
        loadConfigStr() {
            return fetch('/api/loadconfigstr', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then((res) => {
                if (!res || res.status != 200 || !res.ok) throw new Error('Bad response');
                return res.json();
            }).then((json) => {
                if (!json || json.code != 200) {
                    throw new Error((json && json.msg) || 'Unknow reason');
                }
            
                return json.msg || '[]';
            });
        },

        saveConfig(name) {
            if (!name) {
                this.saveAsConfig();
                return;
            }

            if (!confirm(`Confirm to overwrite: ${name}?`)) return;
            localStorage.setItem(LS_CONFIG_NAME, this.configName);
            localStorage.setItem(LS_CONFIG_PREFIX + name, this.getConfigStr());
        },
        loadConfig(name) {
            if (!name) return;

            try {
                const json = JSON.parse(localStorage.getItem(LS_CONFIG_PREFIX + name));
                codeEditor.set(json);
                treeEditor.set(json);

                localStorage.setItem(LS_CONFIG_NAME, this.configName);
            } catch (e) {
                showError(`Failed to load: ${e.message}`);
            }
        },
        saveAsConfig() {
            MessageBox.prompt('Config name', {
                callback: (action, instance) => {
                    if (action != 'confirm') return;
                    
                    this.doSave(instance.inputValue);
                }
            });
        },
        doSave(name) {
            if (!name) return;

            const isExisted = _.some(this.configNameList, (n) => n == name);
            if (!isExisted) {
                this.configNameList.push(name);
            }

            this.configName = name;
            localStorage.setItem(LS_CONFIG_NAME, this.configName);
            localStorage.setItem(LS_CONFIG_PREFIX + name, this.getConfigStr());

            showNotification(`Config ${name} saved!`);
        },
        deleteConfig(name) {
            if (!name) return;
            if (!confirm(`Confirm to delete: ${name}?`)) return;

            this.configName = '';
            _.some(this.configNameList, (n, i) => {
                if (n == name) {
                    this.configNameList.splice(i, 1);
                    return true;
                }
            });

            localStorage.removeItem(LS_CONFIG_NAME);
            localStorage.removeItem(LS_CONFIG_PREFIX + name);
        },
        applyConfig() {
            const jsonstr = this.getConfigStr();
            if (this.configName && localStorage.getItem(LS_CONFIG_PREFIX + this.configName) != jsonstr) {
                // the selected has been modified
                this.configName = '';
                localStorage.removeItem(LS_CONFIG_NAME);
            }

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
        },
        clearConfig() {
            codeEditor.set([]);
            treeEditor.set([]);

            this.applyConfig();
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