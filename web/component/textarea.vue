<template>
    <div class="container">
        <div class="title">{{ title }}</div>
        <textarea ref="textarea" readonly :value="content" :style="{height: `${height}px`}"></textarea>
    </div>
</template>
<script>
'use strict';
export default {
    props: {
        title: String,
        content: String
    },
    data() {
        return {
            height: 40
        };
    },
    watch: {
        content() {
            this.height = 0;
            this.$nextTick(() => {
                this.height = this.$refs.textarea.scrollHeight;
            });
        }
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
    border: 1px solid #d7d7d7;
    resize: none;
}
</style>