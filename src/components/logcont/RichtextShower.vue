/** 之所以跟 RichtextEditor.vue 分开因为 quill-image-resize-module 是组件内全局 import 的，光用 css 没法修改 */
<template>
  <div
    class="richtextshower">
    <quill-editor
      class="editor"
      v-model="content"
      ref="myQuillEditor"
      :options="editorOption"
      disabled>
    </quill-editor>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { quillEditor } from 'vue-quill-editor';
import hljs from 'highlight.js';

@Component({
  components: {
    quillEditor
  }
})
export default class Editor extends Vue {
  @Prop() logcont: any;

  content: any = '';
  editorOption: any = {  // 编辑器配置
    modules: {
      syntax: {
        highlight: (text: any) => hljs.highlightAuto(text).value
      },
      clipboard: { // 这个设置是防止每次保存都有莫名其妙的空行“<p><br></p>”插入到内容中
        matchVisual: false
      }
    },
    theme: 'snow'
  };

  @Watch("logcont")
  handleLogChange() {
    this.content = this.logcont;
  }

  mounted() {
    this.$nextTick(function () {
      this.content = this.logcont;
    });
  }

}
</script>

<style lang="less">
  .richtextshower {
    letter-spacing: 1px;
    .ql-toolbar {
      display: none;
    }
    .ql-container {
      width: 100%;
      font-size: 14px;
      img {
        max-width: 100%;
      }
    }
    .ql-container.ql-snow {
      border-color: transparent;
    }
  }
</style>
