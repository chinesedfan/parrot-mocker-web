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
    .button {
        display: inline-block;
    }
    .client-id {
        display: inline-block;
    }
}
</style>