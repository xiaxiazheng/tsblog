<template>
  <div class="log">
    <!-- 日志列表 -->
    <transition name="slide-fade">
      <div class="loglist ScrollBar" v-if="!showCont">
        <h3>所有日志</h3>
        <div class="option">
          <div class="tabs">
            <span :class="{'active': sortType === 'create'}" @click="sortType='create'">按创建时间</span>
            <span :class="{'active': sortType === 'modify'}" @click="sortType='modify'">按修改时间</span>
          </div>
          <!-- 页码 -->
          <el-pagination
            :current-page.sync="pageNo"
            :page-size="pageSize"
            layout="total, prev, pager, next"
            :total="totalNumber"
            v-if="totalNumber !== 0">
          </el-pagination>
        </div>
        <ul class="log-list">
          <li v-for="(item, index) of list" :key="index" @click="choiceLog(item.log_id)">
            <div>
              <span class="title" :title="item.title">{{item.title}}</span>
              <span class="author" :title="item.author">{{item.author}}</span>
            </div>
            <div>
              <span class="time" v-if="sortType === 'create'">创建时间：{{item.cTime}}</span>
              <span class="time" v-if="sortType === 'modify'">修改时间：{{item.mTime}}</span>
            </div>
          </li>
        </ul>
      </div>
    </transition>
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

@Component({
  components: {
    LogCont,
  },
})
export default class AdminLog extends Vue {
  list: object[] = [];
  showCont: boolean = false;
  sortType: 'create' | 'modify' = 'create';
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
      this.showCont = false;
      let res: any = false;
      let params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize
      };
      if (this.sortType === 'create') {
        res = await LogHelper.getLogListShowByCTime(params);
      } else {
        res = await LogHelper.getLogListShowByMTime(params);
      }
      if (res) {
        this.totalNumber = res.totalNumber;
        this.list = res.list;
      }
    }
  }

  @Watch('$route')
  onRouteChanged() { // 路由变化要监听
    this.init();
  }

  // 切换排序方式
  @Watch("sortType")
  hangleSortType() {
    this.pageNo === 1 ? this.init() : this.pageNo = 1;
  }

  // 点击切换页码
  @Watch("pageNo")
  handlePageNo() {
    this.init();
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
    await this.init();
  }
}
</script>

<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .log {
    width: 100%;
    .loglist {
      width: 80%;
      margin: 0 auto;
      padding-top: 22px;
      >h3 {
        font-size: 20px;
      }
      .option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 50px;
        .tabs {
          >span {
            display: inline-block;
            margin-right: 15px;
            padding: 5px 10px;
            border: 1px solid rgba(204,204,204,0.4);
            box-sizing: border-box;
            border-radius: 3px;
            cursor: pointer;
          }
          .active {
            border-color: #409EFF;
            color: #409EFF;
          }
        }
      }
      .addbutton {
        position: fixed;
        left: 5%;
        top: 80px;
        z-index: 2;
      }
      .log-list {
        margin: 10px 50px;
        >li {
          display: flex;
          justify-content: space-between;
          height: 2rem;
          line-height: 2rem;
          border-bottom: 1px solid rgba(204,204,204,0.4);
          box-sizing: border-box;
          text-align: left;
          cursor: pointer;
          &:hover {
            color: #409EFF;
          }
          &:last-child {
            border-color: transparent;
          }
          >div:first-child {
            width: calc(100% - 13rem);
            >span {
              display: inline-block;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
              vertical-align: middle;
              &:first-child {
                width: calc(100% - 5rem);
                margin: 0 0.5rem;
                font-size: 14px;
              }
              &:last-child {
                width: 4rem;
              }
            }
          }
          >div:last-child {
            width: 13rem;
            text-align: right;
            >span {
              margin-right: 0.5rem;
            }
          }
          .author, .time {
            color: #ccc;
          }
        }
      }
    }
    .logdetail {
      width: 100%;
      height: calc(100% - 44px);
      padding: 22px 0;
      .backlist {
        position: fixed;
        left: 5%;
        top: 80px;
        z-index: 2;
      }
      .el-switch {
        position: fixed;
        right: 5%;
        top: 80px;
        z-index: 2;
      }
    }
  }
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .log {
    width: 100%;
    overflow: hidden;
    .loglist {
      width: 100%;
      height: calc(100% - 11px);
      padding-top: 11px;
      >h3 {
        margin: 0 10px 5px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ccc;
        box-sizing: border-box;
        font-size: 17px;
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
      .log-list {
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
    .slide-fade-enter-active {
      transition: all .3s ease;
    }
    .slide-fade-leave-active {
      transition: all .6s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }
    .slide-fade-enter, .slide-fade-leave-to {
      transform: translateX(-10px); /* 这个如果为正数，就是从下到上，为负从上到下，改成X控制左右 */
      opacity: 0;
    }
    .logdetail {
      height: calc(100% - 22px);
      padding: 22px 5px 0;
      .backlist {
        width: 45px;
        height: 40px;
        padding: 0;
        position: fixed;
        left: 5px;
        bottom: 5px;
        opacity: 0.7;
        z-index: 2;
      }
      .el-switch {
        position: fixed;
        right: 5%;
        top: 80px;
        z-index: 2;
      }
    }
  }
}
</style>
