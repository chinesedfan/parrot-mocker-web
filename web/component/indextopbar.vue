<template>
    <div>
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

</style>