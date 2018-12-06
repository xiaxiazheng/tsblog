<template>
  <div class="logcont">
    <h2 class="title">{{title}}</h2>
    <h3 class="author">{{author}}</h3>
    <div class="time">
      <span>创建时间: {{cTime}}</span>
      <span>修改时间：{{mTime}}</span>
    </div>
    <!-- <div class="logcont" v-html="logcont"></div> -->
    <vue-editor v-model="logcont" disabled></vue-editor>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { LogClient } from '@/util/clientHelper';
import { VueEditor } from 'vue2-editor';

@Component({
  components: {
    VueEditor
  },
})
export default class LogCont extends Vue {
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

  @Watch('$route')
  onRouteChanged() { // 路由变化要监听
    this.init();
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
}
</script>

<style lang="less">
  .logcont {
    width: 90%;
    height: 100%;
    margin: 0 auto;
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
        margin: 0 3px;
      }
    }
    .logcont {
      font-size: 1rem;
      text-align: left;
    }

    // 无奈之举23333
    .ql-container.ql-snow {
      border-color: transparent;
    }
    .ql-toolbar {
      display: none;
    }
  }
</style>
