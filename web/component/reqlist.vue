<template>
    <table :class="clsNames">
        <tbody>
            <tr v-for="item in items" ref="tr" :class="{mock: item.isMock}">
                <td>{{ item.method }}</td>
                <td :class="getStatusColor(item.status)">{{ item.status }}</td>
                <td>{{ item.host }}</td>
                <td><a href="javascript:void(0)" @click="onItemClicked(item)">{{ item.pathname }}</a></td>
                <td>{{ getFormattedTime(item.timecost) }}</td>
                <td>{{ item.timestamp }}</td>
            </tr>  
        </tbody>
    </table>
</template>
<script>
'use strict';

import {types} from '../store/index.js';

export default {
    props: {
        clsNames: String
    },
    computed: {
        items() {
            return this.$store.state.records;
        }
    },
    watch: {
        items(val, oldVal) {
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
}
</style>