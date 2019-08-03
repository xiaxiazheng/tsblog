<template>
  <div
    class="adminlogcont"
    :class="{
      'width70': edittype === 'richtext',
      'width90': edittype === 'markdown'
    }">
    <el-button class="backbutton" v-if="!isModify" icon="el-icon-back" plain @click="backToLogList"></el-button>
    <el-button class="backbutton" v-if="isModify" type="danger" icon="el-icon-back" plain @click="backToLogList" title="请注意保存"></el-button>
    <el-button class="savebutton" type="primary" icon="el-icon-check" @click="saveLog" title="保存日志"></el-button>
    <el-input class="title" v-model="title" placeholder="请输入标题"></el-input>
    <el-input class="author" v-model="author" placeholder="请输入作者"></el-input>
    <div class="time">
      <span>创建时间: {{cTime}}</span>
      <span>修改时间：{{mTime}}</span>
    </div>
    <!-- 富文本编辑框 -->
    <vue-editor v-if="edittype === 'richtext'" class="vueeditor" v-model="logcont"></vue-editor>
    <!-- Markdown 编辑框和展示框 -->
    <div v-if="edittype === 'markdown'" class="markdownbox">
      <el-input class="markdown-editor" type="textarea" resize="none" v-model="logcont"></el-input>
      <div class="markdown-shower ScrollBar" v-html="markHTML"></div>  
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { VueEditor } from 'vue2-editor';
import { LogHelper } from '@/client/LogHelper';
import marked from 'marked';

@Component({
  components: {
    VueEditor
  },
})
export default class AdminLogCont extends Vue {
  @Prop({ type: Function }) backLogList: any;

  logid: string = '';
  title: string = '';
  author: string = '';
  cTime: string = '';
  mTime: string = '';
  logcont: string = '';
  titleBackup: string = "";
  authorBackup: string = "";
  logcontBackup: string = '';
  markHTML: string = '';
  isModify: boolean = false;  // 页面内容是否修改了
  edittype: 'richtext' | 'markdown' = 'richtext';

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  async init() {
    if (this.$route.query.id) {
      let id = decodeURIComponent(atob(<string>this.$route.query.id));
      let res = await LogHelper.getLogCont(id);
      this.logid = res.log_id;
      this.title = res.title;
      this.author = res.author;
      this.cTime = res.cTime;
      this.mTime = res.mTime;
      this.edittype = res.edittype;
      this.logcont = res.logcont;
      // 备份，用于做是否修改的检查
      this.titleBackup = res.title;
      this.authorBackup = res.author;
      this.logcontBackup = res.logcont;
    }
  }

  @Watch('title')
  @Watch('author')
  @Watch('logcont')
  handleEdit() {
    // 若为 markdown 则修改就显示效果
    this.edittype === 'markdown' && (this.markHTML = marked(this.logcont));
    // 若修改了就标记状态
    this.isModify = (
      this.title !== this.titleBackup || 
      this.author !== this.authorBackup || 
      this.logcont !== this.logcontBackup 
    ) ? true : false;
  }

  // 返回日志列表
  backToLogList() {
    if (this.isModify) {
      this.$confirm(`日志内容已被修改且未保存，确定返回？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.backLogList();
      });
    } else {
      this.backLogList();
    }
  }

  async saveLog() {
    let params = {
      id: this.logid,
      title: this.title,
      author: this.author,
      logcont: this.logcont
    };
    let res = await LogHelper.modifyLogCont(params);
    if (res) {
      this.$message.success(res);
      // 清空为未修改状态
      this.logcontBackup = this.logcont;
      this.isModify = false;
    } else {
      this.$message.error('保存失败');
    }
  }
}
</script>

<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .width70 { width: 70%; }
  .width90 { width: 90%; }
  .adminlogcont {
    margin: 0 auto;
    .title {
      width: 50%;
      .el-input__inner {
        text-align: center;
      }
    }
    .author {
      display: block;
      width: 30%;
      margin: 10px auto;
      .el-input__inner {
        text-align: center;
      }
    }
    .time {
      margin-bottom: 10px;
      >span {
        margin: 0 3px;
        color: #ccc;
      }
    }
    .backbutton {
      position: fixed;
      left: 5%;
      top: 80px;
      z-index: 2;
    }
    .savebutton {
      position: fixed;
      left: 5%;
      top: 125px;
      margin-left: 0;
    }
    // 富文本编辑器
    .vueeditor {
      height: 660px;
      margin-bottom: 45px;
      // 在这里写里面进度条的样式
      .ql-editor {
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
    // markdown 编辑器
    .markdownbox {
      height: 35rem;
      >div {
        width: 50%;
        height: 100%;
        vertical-align: top;
      }
      .markdown-editor {
        textarea {
          height: 100%;
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
      .markdown-shower {
        display: inline-block;
        padding: 5px 15px;
        color: #606266;
        background-color: #fff;
        border: 1px solid #dcdfe6;
        box-sizing: border-box;
        border-radius: 4px;
        text-align: left;
        word-break: break-all;
        font-size: 13px;
      }
    }
  }
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .adminlogcont {
    width: 100%;
    height: 100%;
    .title {
      width: 60%;
      .el-input__inner {
        text-align: center;
      }
    }
    .author {
      display: block;
      width: 30%;
      margin: 10px auto;
      .el-input__inner {
        text-align: center;
      }
    }
    .time {
      margin-bottom: 10px;
      color: #ccc;
      >span {
        display: block;
      }
    }
    .backbutton {
      position: fixed;
      left: 5px;
      bottom: 5px;
      z-index: 2;
      width: 40px;
      height: 40px;
      padding: 0;
      opacity: 0.7;
    }
    .savebutton {
      position: fixed;
      right: 5px;
      bottom: 49px;
      width: 34px;
      height: 36px;
      margin-left: 0;
      padding: 0;
      z-index: 2;
    }
  }
}
</style>
