/** 专门显示 markdown 的组件 */
<template>
  <div class="markdown-shower" v-html="markHTML" v-highlight>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import marked from 'marked';

@Component
export default class ImageBox extends Vue {
  @Prop() markCont: any;

  markHTML: string = '';

  mounted() {
    this.$nextTick(function() {
      this.handleEditMarkCont();
    });
  }

  @Watch("markCont")
  handleEditMarkCont() {
    this.markHTML = marked(this.markCont);
  }
}
</script>

<style lang="less">
  .markdown-shower {
    display: inline-block;
    width: 100%;
    padding: 5px 15px;
    color: #606266;
    text-align: left;
    word-break: break-all;
    font-size: 14px;
  }
</style>