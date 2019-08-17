<template>
  <div class="markdown" v-html="markHTML" v-highlight>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import marked from 'marked';

@Component
export default class ImageBox extends Vue {
  @Prop() logcont: any;

  markCont: string = '';
  markHTML: string = '';

  mounted() {
    this.$nextTick(function() {
      this.markCont = this.logcont;
      // this.markHTML = marked(this.logcont);
    });
  }

  @Watch('markCont')
  handleWatch() {
    this.markHTML = marked(this.markCont);
  }
}
</script>

<style lang="less">
  .markdown {
    display: inline-block;
    width: 100%;
    padding: 5px 15px;
    color: #606266;
    text-align: left;
    word-break: break-all;
    font-size: 14px;
  }
</style>