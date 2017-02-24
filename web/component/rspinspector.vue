<template>
    <div :class="clsNames">
        <mytextarea title="Url:"></mytextarea>
        <mytextarea title="Request headers:"></mytextarea>
        <mytextarea title="Form data:"></mytextarea>
        <mytextarea title="Response headers:"></mytextarea>
        <mytextarea title="Response body:"></mytextarea>
    </div>
</template>
<script>
'use strict';

import TextArea from './textarea';

export default {
    props: {
        clsNames: String
    },
    components: {
        mytextarea: TextArea
    }
};
</script>
<style lang="less" scoped>
</style>