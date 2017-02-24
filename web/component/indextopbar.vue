<template>
    <div class="container">
        <div class="button">register</div>
        <div class="button">mock配置</div>
        <div class="device-name">{{ `设备: ${deviceName}` }}</div>
    </div>
</template>
<script>
'use strict';
export default {
    props: {
        deviceName: String
    }
};
</script>
<style lang="less" scoped>
.container {
    .button {
        display: inline-block;
    }
    .device-name {
        display: inline-block;
    }
}
</style>