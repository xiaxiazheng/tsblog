<template>
  <div class="adminlogcont">
    <el-button class="savebutton" type="primary" icon="el-icon-check" @click="saveLog"></el-button>
    <el-input class="title" v-model="title" placeholder="请输入标题"></el-input>
    <el-input class="author" v-model="author" placeholder="请输入作者"></el-input>
    <div class="time">
      <span>创建时间: {{cTime}}</span>
      <span>修改时间：{{mTime}}</span>
    </div>
    <vue-editor v-model="logcont"></vue-editor>
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
  .adminlogcont {
    width: 90%;
    height: 100%;
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
    .savebutton {
      position: fixed;
      right: 5%;
      bottom: 80px;
    }
  }
</style>
