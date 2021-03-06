<template>
  <div class="richtexteditor">
    <quill-editor
      class="editor"
      v-model="content"
      ref="myQuillEditor"
      :options="editorOption"
      @blur="onEditorBlur($event)"
      @focus="onEditorFocus($event)"
      @ready="onEditorReady($event)">
    </quill-editor>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { quillEditor } from 'vue-quill-editor';
import hljs from 'highlight.js';
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);

@Component({
  components: {
    quillEditor
  }
})
export default class Editor extends Vue {
  @Prop() logcont: any;
  @Prop({ type: Function }) getChange?: any;

  content: any = '';
  toolbarOptions: any = [  // 工具条配置
    ['code-block', 'blockquote'],
    ['bold', 'italic', 'underline', 'strike', 'clean'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image'],
  ];
  editorOption: any = {  // 编辑器配置
    placeholder: '请输入内容',
    modules: {
      imageResize: { //调整大小组件。
        displayStyles: {
          backgroundColor: 'black',
          border: 'none',
          color: 'white'
        },
        modules: ['Resize', 'DisplaySize']
      },
      toolbar: {
        container: this.toolbarOptions,  // 工具栏
        handlers: {
          // 劫持插入图片事件
          'image': (value: any) => {
            if (value) {
              // 获取当前光标位置，之所以在这里就获取因为 insertImage 会打开一个弹框，打开之后就丢失了光标位置了
              const editor: any = this.$refs.myQuillEditor;
              let index = editor.quill.getSelection().index;
              this.insertImage(editor.quill, index);
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
  };

  @Watch("logcont")
  handleLogChange() {
    this.content = this.logcont;
  }

  @Watch("content")
  handleChange() {
    this.getChange(this.logcont !== this.content);
  }

  mounted() {
    this.$nextTick(function () {
      this.content = this.logcont;
    });
  }

  // 插入图片
  insertImage(quill: any, cursorIndex: number) {
    this.$prompt('请输入要插入的图片的 url', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }).then((obj: any) => {
      // 插入图片
      quill.insertEmbed(cursorIndex, 'image', obj.value);
      // 调整光标到最后
      quill.setSelection(length + 1);
    }).catch(() => {
      this.$message({
        type: 'info',
        message: '取消插入图片',
        duration: 1000
      });       
    });
  }

  returnContent() {
    // console.log(this.content);
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
  .richtexteditor {
    letter-spacing: 1px;
    .ql-container {
      width: 100%;
      font-size: 14px;
      img {
        max-width: 100%;
      }
      .ql-editor {
        width: 100%;
        max-height: 646px;
        min-height: 470px;
        overflow-y: auto;
        & {
          display: inline-block;
          overflow:hidden;
          overflow-y: auto;
        }
        &::-webkit-scrollbar {
          /*滚动条整体样式*/
          width: 7px; /* 高宽分别对应横竖滚动条的尺寸 */
          height: 7px;
        }
        &::-webkit-scrollbar-thumb {
          /*滚动条里面小方块*/
          border-radius: .5rem;
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          background: #dcdfe6;
        }
        &::-webkit-scrollbar-track {
          /*滚动条里面轨道*/
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          border-radius: .5rem;
          background: white;
        }        
      }
    }
  }
</style>
