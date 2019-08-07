<template>
  <div class="log">
    <!-- 日志列表 -->
    <div class="logbox ScrollBar" v-show="!showCont">
      <!-- 日志分类 -->
      <el-tabs type="border-card" v-model="activeClassification">
        <el-tab-pane v-for="(item, index) of logClassList" :key="index" :name="item">
          <!-- tab 头 -->
          <span slot="label" :title="item">
            <i v-if="item === mainClassName" class="el-icon-house"></i>
            {{item}}
          </span>
          <!-- 日志操作选项 -->
          <div class="option">
            <div class="tabs">
              <span :class="{'active': orderBy === 'create'}" @click="orderBy='create'">按创建时间</span>
              <span :class="{'active': orderBy === 'modify'}" @click="orderBy='modify'">按修改时间</span>
            </div>
            <!-- 日志搜索框 -->
            <LogSearch type="home" :classification="activeClassification"></LogSearch>
            <!-- 页码 -->
            <el-pagination
              class="pagination"
              :current-page.sync="pageNo"
              :page-size="pageSize"
              layout="total, prev, pager, next"
              :total="totalNumber"
              v-if="totalNumber !== 0">
            </el-pagination>
          </div>
          <!-- 日志列表 -->
          <ul class="log-list" v-if="loglist.length !== 0" v-loading="isloadinglist" element-loading-text="日志列表加载中">
            <li
              v-for="(item, index) of loglist"
              :key="index"
              @click="choiceLog(item.log_id)"
              :class="{'stick-item': item.isStick === 'true'}">
              <div class="log-msg">
                <span class="title" :title="item.title">{{item.title}}</span>
                <span class="author" :title="item.author">{{item.author}}</span>
                <span class="time" v-if="orderBy === 'create'">创建时间：{{item.cTime}}</span>
                <span class="time" v-if="orderBy === 'modify'">修改时间：{{item.mTime}}</span>
              </div>
            </li>
          </ul>
          <div v-else class="noLogTips">暂无日志</div>            
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 日志详情 -->
    <div class="logdetail ScrollBar" v-if="showCont">
      <LogCont :backLogList="backLogList"></LogCont>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import LogCont from '@/components/logcont/LogCont.vue';
import { LogHelper } from '@/client/LogHelper';
import LogSearch from '@/components/logcont/LogSearch.vue';

@Component({
  components: {
    LogCont,
    LogSearch
  },
})
export default class AdminLog extends Vue {
  mainClassName: string = '所有日志';  // 常量，主要分类的名称
  logClassList: string[] = [];
  loglist: object[] = [];
  showCont: boolean = false;
  orderBy: 'create' | 'modify' = 'create';
  activeClassification: string = this.mainClassName;
  isloadinglist: boolean = false;
  // 分页
  totalNumber: number = 0;
  pageNo: number = 1;
  pageSize: number = 15;

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  async init() {
    if (this.$route.query.id) {
      this.showCont = true;
    } else {
      // 获取日志分类
      let res = await LogHelper.getHomeLogAllClass();
      this.logClassList = res || [];
      this.logClassList.unshift(this.mainClassName);
      await this.getLogList();
    }
  }

  // 获取日志列表
  @Watch('activeClassification')
  async getLogList() {
    this.isloadinglist = true;
    this.showCont = false;
    let params: any = {
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      isVisible: true,
    };
    this.activeClassification !== this.mainClassName && (params.classification = this.activeClassification);
    let res = await LogHelper.getLogListIsVisible(params);
    if (!res) {
      res = {
        totalNumber: 0,
        list: []
      };
    }
    this.isloadinglist = false;
    this.totalNumber = res.totalNumber;
    this.loglist = res.list;
  }

  @Watch('$route')
  onRouteChanged() { // 路由变化要监听~
    this.init();
  }

  // 切换排序方式
  @Watch("orderBy")
  hangleorderBy() {
    this.pageNo === 1 ? this.getLogList() : this.pageNo = 1;
  }

  // 点击切换页码
  @Watch("pageNo")
  handlePageNo() {
    this.getLogList();
  }

  // 选择一篇日志
  choiceLog(id: string) {
    this.$router.push({ // 点击节点就改路由
      query: {
        id: btoa(encodeURIComponent(id))
      }
    });
    this.showCont = true;
  }

  // 返回日志列表
  async backLogList() {
    this.$router.push({ query: {} });
  }
}
</script>

<style lang="less">
@import '../../static/less/logList.less';

@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .log {
    width: 100%;
    .noLogTips {
      margin-top: 2rem;
      letter-spacing: .1rem;
      font-size: 16px;
      font-weight: bold;
      color: palevioletred;
    }
    .logdetail {
      width: 100%;
      height: calc(100% - 44px);
      padding: 22px 0;
    }
  }
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .log {
    width: 100%;
    overflow: hidden;
    .logbox {
      width: 100%;
      height: calc(100% - 10px);
      margin: 0 auto;
      padding-top: 10px;
      >h3 {
        margin: 0 10px 5px;
        padding-bottom: 5px;
        font-size: 17px;
        border-bottom: 1px solid #ccc;
        box-sizing: border-box;
      }
      .option {
        position: fixed;
        bottom: 0;
        left: 10px;
        right: 10px;
        text-align: left;
        padding-top: 6px;
        border-top: 1px solid #ccc;
        box-sizing: border-box;
        .tabs {
          display: none;
        }
      }
      .addbutton {
        position: fixed;
        bottom: 1px;
        right: 10px;
        z-index: 2;
        padding: 0;
        width: 44px;
        height: 35px;
        opacity: 0.7;
      }
      >ul {
        height: calc(100% - 80px);
        overflow-y: auto;
        padding: 0 10px;
        >li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(204,204,204,0.4);
          box-sizing: border-box;
          text-align: left;
          cursor: pointer;
          >div {
            >span {
              display: block;
            }
            i {
              font-size: 14px;
            }
            i:hover {
              color: red;
            }
          }
          .title {
            margin: 3px 0;
            font-size: 14px;
          }
          .author {
            color: #ccc;
          }
          .time {
            display: none;
          }
        }
        >li:hover {
          color: #409EFF;
        }
        >li:last-child {
          border-color: transparent;
        }
      }
    }
    .logdetail {
      height: calc(100% - 20px);
      padding: 10px 5px;
      .el-switch {
        position: fixed;
        right: 17px;
        top: 50px;
        z-index: 2;
        opacity: 0.7;
      }
    }
  }
}
</style>
