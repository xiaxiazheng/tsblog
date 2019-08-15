<template>
  <div class="editorBox" :class="{ 'onlyShow': type === 'onlyShow'}">
    <quill-editor class="editor"
                  v-model="content"
                  ref="myQuillEditor"
                  :options="editorOption"
                  @blur="onEditorBlur($event)"
                  @focus="onEditorFocus($event)"
                  @ready="onEditorReady($event)"
                  :disabled="type==='onlyShow'">
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
  @Prop() type: any;
  @Prop() logcont: any;
  @Prop({ type: Function }) getChange?: any;

  content: any = '';
  toolbarOptions: any = [
    ['code-block', 'blockquote'],
    ['bold', 'italic', 'underline', 'strike', 'clean'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image'],
  ];
  editorOption: any = {
    placeholder: '请输入内容',
    modules: {
      toolbar: {
        container: this.toolbarOptions,  // 工具栏
        handlers: {
          // 劫持插入图片事件
          'image': (value: any) => {
            if (value) {
              this.insertImage();
            } else {
              const editor: any = this.$refs.myQuillEditor;
              editor.quill.format('image', false);
            }
          }
        }
      },
      syntax: {
        highlight: (text: any) => hljs.highlightAuto(text).value
      },
      clipboard: { // 这个设置是防止每次保存都有莫名其妙的空行“<p><br></p>”插入到内容中
        matchVisual: false
      }
    },
    theme: 'snow'
  }

  @Watch("logcont")
  handleLogChange() {
    this.content = this.logcont;
  }

  @Watch("content")
  handleChange() {
    console.log(this.logcont);
    console.log(this.content);
    this.type !== 'onlyShow' && this.getChange(this.logcont !== this.content);
  }

  mounted() {
    this.$nextTick(function () {
      this.content = this.logcont;
    });
  }

  // 插入图片
  insertImage() {
    this.$prompt('请输入要插入的图片的 url', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }).then((obj: any) => {
      const editor: any = this.$refs.myQuillEditor;
      // 获取当前光标位置
      let length = editor.quill.getSelection().index;
      // 插入图片
      editor.quill.insertEmbed(length, 'image', obj.value);
      // 调整光标到最后
      editor.quill.setSelection(length + 1);
    }).catch(() => {
      this.$message({
        type: 'info',
        message: '取消插入图片',
        duration: 1000
      });       
    });
  }

  returnContent() {
    console.log(this.content);
    return this.content;
  }

  onEditorBlur(quill: any) {
    // console.log('editor blur!', quill);
  }

  onEditorFocus(quill: any) {
    // console.log('editor focus!', quill);
  }

  onEditorReady(quill: any) {
    // console.log('editor ready!', quill);
  }

}
</script>

<style lang="less">
  .editorBox {
    .ql-container {
      min-height: 359px;
      font-size: 14px;
    }
  }
  .onlyShow {
    .ql-container.ql-snow {
      border-color: transparent;
    }
    .ql-toolbar {
      display: none;
    }
  }
</style>
