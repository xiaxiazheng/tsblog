<template>
  <div class="logcont">
    <el-button class="backbutton" icon="el-icon-back" plain @click="backLogList"></el-button>
    <h2 class="title">{{title}}</h2>
    <h3 class="author">{{author}}</h3>
    <div class="time">
      <span>创建时间: {{cTime}}</span>
      <span>修改时间: {{mTime}}</span>
    </div>
    <Editor type="onlyShow" :logcont="logcont"></Editor>
    <div class="markdown" v-if="edittype === 'markdown'" v-html="markHTML" v-highlight></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { LogHelper } from '@/client/LogHelper';
import marked from 'marked';
import Editor from '@/components/Editor.vue';

@Component({
  components: {
    Editor
  }
})
export default class LogCont extends Vue {
  @Prop({ type: Function }) backLogList: any;

  logid: string = '';
  title: string = '';
  author: string = '';
  cTime: string = '';
  mTime: string = '';
  logcont: string = '';
  markHTML: string = '';  // 根据 logcont 写的 markdown 转换成的 html
  edittype: 'richtext' | 'markdown' = 'richtext';

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  @Watch('$route')
  onRouteChanged() { // 路由变化要监听
    this.init();
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
      this.logcont = res.logcont;
      this.edittype = res.edittype;
      this.edittype === 'markdown' && (this.markHTML = marked(this.logcont));
    }
  }
}
</script>

<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .logcont {
    width: 70%;
    margin: 0 auto;
    .backbutton {
      position: fixed;
      left: 5%;
      top: 80px;
      z-index: 2;
    }
    .title {
      font-size: 20px;
    }
    .author {
      margin: 10px 0;
    }
    .time {
      margin-bottom: 10px;
      color: #ccc;
      >span {
        margin: 0 3px;
      }
    }
    .logcont {
      font-size: 1rem;
      text-align: left;
    }
    .richtext, .markdown {
      display: inline-block;
      width: 100%;
      padding: 5px 15px;
      color: #606266;
      text-align: left;
      word-break: break-all;
    }
  }  
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .logcont {
    width: 100%;
    height: 100%;
    .title {
      font-size: 16px;
    }
    .author {
      margin: 10px 0;
    }
    .time {
      margin-bottom: 10px;
      color: #ccc;
      >span {
        display: block;
      }
    }
  }  
}
</style>
