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
                    <a id="help" title="Open documentation (opens in a new window)" href="https://github.com/chinesedfan/parrot-mocker-web/blob/master/doc/zh/how-to-config.md" target="_blank">Help</a>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
'use strict';

import _ from 'lodash';
import {Message, MessageBox} from 'element-ui';
import {LS_CONFIG_CURRENT, LS_CONFIG_NAME, LS_CONFIG_NAME_LIST, LS_CONFIG_PREFIX} from '../localstorage.js';
import {loadConfigStr, updateConfig} from '../apis';

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

        loadConfigStr().then((serverStr) => {
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
            try {
                // able to save anything that the editor argeed
                // including empty string, which will be converted to empty array
                const json = codeEditor.get() || [];
                return JSON.stringify(json);
            } catch(e) {
                showError('Invalid JSON');
                // keep throwing out to break the current operation
                throw e;
            }
        },

        saveConfig(name) {
            if (!name) {
                // no current config name
                this.saveAsConfig();
                return;
            }

            const configStr = this.getConfigStr();
            MessageBox.confirm(`Confirm to overwrite: ${name}?`, {
                callback: (action) => {
                    if (action != 'confirm') return;
                    
                    this.doSave(name, configStr);
                }
            });
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
            const configStr = this.getConfigStr();
            MessageBox.prompt('Config name', {
                callback: (action, instance) => {
                    if (action != 'confirm') return;
                    
                    this.doSave(instance.inputValue, configStr);
                }
            });
        },
        doSave(name, configStr) {
            if (!name) return;

            const isExisted = _.some(this.configNameList, (n) => n == name);
            if (!isExisted) {
                this.configNameList.push(name);
            }

            this.configName = name;
            // overwrite silently
            localStorage.setItem(LS_CONFIG_NAME, this.configName);
            localStorage.setItem(LS_CONFIG_PREFIX + name, configStr);

            showNotification(`Config ${name} saved!`);
        },
        deleteConfig(name) {
            if (!name) return;

            MessageBox.confirm(`Confirm to delete: ${name}?`, {
                callback: (action) => {
                    if (action != 'confirm') return;
                    
                    this.doDelete(name);
                }
            });
        },
        doDelete(name) {
            this.configName = '';
            _.some(this.configNameList, (n, i) => {
                if (n == name) {
                    this.configNameList.splice(i, 1);
                    return true;
                }
            });

            localStorage.removeItem(LS_CONFIG_NAME);
            localStorage.removeItem(LS_CONFIG_PREFIX + name);

            showNotification(`Config ${name} deleted!`);
        },
        applyConfig() {
            const jsonstr = this.getConfigStr();
            if (this.configName && localStorage.getItem(LS_CONFIG_PREFIX + this.configName) != jsonstr) {
                // the selected has been modified
                this.configName = '';
                localStorage.removeItem(LS_CONFIG_NAME);
            }

            localStorage.setItem(LS_CONFIG_CURRENT, jsonstr);

            updateConfig(jsonstr).then((msg) => {
                showNotification(msg);
            }).catch((e) => {
                showError(e.message);
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