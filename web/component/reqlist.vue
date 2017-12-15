<template>
    <table :class="clsNames">
        <tbody>
            <tr v-for="item in items" ref="tr" @click="onItemClicked(item)"
                    :class="{mock: item.isMock, selected: selectedItem && item.id == selectedItem.id}">
                <td>{{ item.method }}</td>
                <td :class="getStatusColor(item.status)">{{ item.status }}</td>
                <td>{{ item.host }}</td>
                <td><a href="javascript:void(0)">{{ item.pathname }}</a></td>
                <td v-show="item.timecost >= 0">{{ getFormattedTime(item.timecost) }}</td>
                <td v-show="item.timecost < 0"><div class="loading"></div></td>
                <td>{{ item.timestamp }}</td>
            </tr>  
        </tbody>
    </table>
</template>
<script>
'use strict';

import _ from 'lodash';
import {types} from '../store/index.js';

export default {
    props: {
        clsNames: String
    },
    data() {
        return {
            selectedItem: null
        };
    },
    computed: {
        items() {
            return this.$store.state.records;
        }
    },
    watch: {
        items(val, oldVal) {
            if (_.isEmpty(val)) return;

            this.$nextTick(() => {
                this.$refs.tr[val.length - 1].scrollIntoView();
            });
        }
    },
    methods: {
        getStatusColor(status) {
            let color = 'green';
            if (status != 200) color = 'red';
            if (status == 302) color = 'darkgray';
            return color;
        },
        getFormattedTime(time) {
            if (time < 0) return '';

            const sec = 1000;
            const min = 60 * sec;
            if (time < sec) {
                return time + 'ms';
            } else if (time < min) {
                return Math.round(time * 100 / sec) / 100 + 's';
            } else {
                return Math.round(time / min) + 'm' + Math.round(time % min / 1000) + 's';
            }
        },
        onItemClicked(item) {
            this.selectedItem = item;
            this.$store.commit(types.UPDATE_SELECTED_RECORD, item);
        }
    }
};
</script>
<style lang="less" scoped>
table {
    width: 100%;
    border-spacing: 0;
}
tr {
    &:nth-child(2n+1) {
        background-color: snow;
    }

    &.mock {
        font-style: italic;
        background-color: #ffdead;
    }
    &.selected {
        background-color: #edf2fc;
    }
    &:hover {
        background-color: #edf2fc;
    }
}
td {
    padding: 4px 2px;
    border-bottom: 1px solid darkgray;

    &.green {
        color: green;
    }
    &.darkgray {
        color: darkgray;
    }
    &.red {
        color: red;
    }

    .loading {
        width: 16px;
        height: 16px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url(data:image/gif;base64,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);
    }
}
</style>