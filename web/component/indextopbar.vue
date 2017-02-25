<template>
    <div class="container">
        <div class="button">register</div>
        <div class="button">mock配置</div>
        <div class="client-id">{{ `clientID: ${clientID}` }}</div>
    </div>
</template>
<script>
'use strict';
export default {
    computed: {
        clientID() {
            return this.$store.state.clientID;
        }
    }
};
</script>
<style lang="less" scoped>
.container {
    padding: 0px 10px;
    line-height: 30px;
    color: white;
    background-color: black;

    .button {
        display: inline-block;
        padding: 4px;
        line-height: 16px;
        color: black;
        background-color: white;
        border-radius: 3px;
    }
    .client-id {
        display: inline-block;
    }
}
</style>