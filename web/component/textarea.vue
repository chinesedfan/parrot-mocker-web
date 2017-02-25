<template>
    <div class="container">
        <div class="title">{{ title }}</div>
        <textarea :value="content"></textarea>
    </div>
</template>
<script>
'use strict';
export default {
    props: {
        title: String,
        content: String
    }
};
</script>
<style lang="less" scoped>
.container {
    padding: 0 5px;
}
.title {
    padding: 3px 0;
}
textarea {
    width: 90%;
    padding: 3px;
}
</style>