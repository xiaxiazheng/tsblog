<template>
  <div class="adminlogcont">
    <el-button class="savebutton" type="primary" icon="el-icon-check" @click="saveLog"></el-button>
    <el-input class="title" v-model="title" placeholder="请输入标题"></el-input>
    <el-input class="author" v-model="author" placeholder="请输入作者"></el-input>
    <div class="time">
      <span>创建时间: {{cTime}}</span>
      <span>修改时间：{{mTime}}</span>
    </div>
    <vue-editor class="vueeditor" v-model="logcont"></vue-editor>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { VueEditor } from 'vue2-editor';
import { LogClient } from '@/util/clientHelper';

@Component({
  components: {
    VueEditor
  },
})
export default class AdminLogCont extends Vue {
  logid: string = '';
  title: string = '';
  author: string = '';
  cTime: string = '';
  mTime: string = '';
  logcont: string = '';

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  async init() {
    if (this["$route"].query.id) {
      let id = decodeURIComponent(atob(<string>this["$route"].query.id));
      let res = await LogClient.getLogCont(id);
      this.logid = res.data.log_id;
      this.title = res.data.title;
      this.author = res.data.author;
      this.cTime = res.data.cTime;
      this.mTime = res.data.mTime;
      this.logcont = res.data.logcont;
    }
  }

  async saveLog() {
    let params = {
      id: this.logid,
      title: this.title,
      author: this.author,
      logcont: this.logcont
    };
    let res = await LogClient.modifyLogCont(params);
    this["$message"]({
      type: res.resultsCode,
      message: res.message
    });
  }
}
</script>

<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .adminlogcont {
    width: 75%;
    height: 100%;
    margin: 0 auto;
    padding-bottom: 70px;
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
    .savebutton {
      position: fixed;
      right: 5%;
      bottom: 40px;
    }
    // 编辑器
    .vueeditor {
      height: 660px;
      // 在这里写里面进度条的样式
      .ql-editor::-webkit-scrollbar {
        /*滚动条整体样式*/
        width: 7px; /* 高宽分别对应横竖滚动条的尺寸 */
        height: 7px;
      }
      .ql-editor::-webkit-scrollbar-thumb {
        /*滚动条里面小方块*/
        border-radius: .5rem;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        background: #dcdfe6;
      }
      .ql-editor::-webkit-scrollbar-track {
        /*滚动条里面轨道*/
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        border-radius: .5rem;
        background: white;
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
    .savebutton {
      position: fixed;
      right: 5px;
      bottom: 49px;
      width: 34px;
      height: 36px;
      padding: 0;
      z-index: 2;
    }
  }
}
</style>
