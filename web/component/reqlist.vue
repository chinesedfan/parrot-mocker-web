<template>
    <table :class="clsNames">
        <tbody>
            <tr v-for="item in items">
                <td>{{ item.method }}</td>
                <td :class="getStatusColor(item.status)">{{ item.status }}</td>
                <td>{{ item.host }}</td>
                <td><a href="javascript:void(0)">{{ item.pathname }}</a></td>
                <td>{{ getFormattedTime(item.timecost) }}</td>
                <td>{{ item.timestamp }}</td>
            </tr>  
        </tbody>
    </table>
</template>
<script>
'use strict';
export default {
    props: {
        clsNames: String
    },
    computed: {
        items() {
            return this.$store.state.records;
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
            const sec = 1000;
            const min = 60 * sec;
            if (time < sec) {
                return time + 'ms';
            } else if (time < min) {
                return Math.round(time * 100 / sec) / 100 + 's';
            } else {
                return Math.round(time / min) + 'm' + Math.round(time % min / 1000) + 's';
            }
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