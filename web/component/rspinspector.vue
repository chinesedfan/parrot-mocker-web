<template>
    <div :class="clsNames">
        <mytextarea title="Url:" :content="url"></mytextarea>
        <mytextarea title="Request headers:" :content="requestHeaders"></mytextarea>
        <mytextarea title="Form data:" :content="requestData"></mytextarea>
        <mytextarea title="Response headers:" :content="responseHeaders"></mytextarea>
        <mytextarea title="Response body:" :content="responseBody"></mytextarea>
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
    },
    computed: {
        url() {
            return this.getRecordFieldRaw('url');
        },
        requestHeaders() {
            return this.getRecordFieldJson('requestHeaders')
        },
        requestData() {
            return this.getRecordFieldJson('requestData');
        },
        responseHeaders() {
            return this.getRecordFieldJson('responseHeaders');
        },
        responseBody() {
            return this.getRecordFieldJson('responseBody');
        }
    },
    methods: {
        getRecordFieldRaw(key) {
            const record = this.$store.state.selectedRecord;
            return record ? record[key] : '';
        },
        getRecordFieldJson(key) {
            const str = this.getRecordFieldRaw(key);
            return str ? JSON.stringify(str, null, 4) : '';
        }
    }
};
</script>
<style lang="less" scoped>
</style>