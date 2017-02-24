<template>
    <table :class="clsNames">
        <tbody>
            <tr v-for="item in items">
                <td>{{ item.method }}</td>
                <td>{{ item.host }}</td>
                <td>{{ item.pathname }}</td>
                <td>{{ item.timecost }}</td>
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
    }
};
</script>
<style lang="less" scoped>
</style>