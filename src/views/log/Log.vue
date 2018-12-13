<template>
  <div class="log">
    <!-- 日志列表 -->
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
      <ul>
        <li v-for="(item, index) of list" :key="index" @click="choiceLog(item.log_id)">
          <div>
            <span class="title">{{item.title}}</span>
            <span class="author">{{item.author}}</span>
          </div>
          <div>
            <span class="time" v-if="sortType === 'create'">创建时间：{{item.cTime}}</span>
            <span class="time" v-if="sortType === 'modify'">修改时间：{{item.mTime}}</span>
          </div>
        </li>
      </ul>
    </div>
    <!-- 日志详情 -->
    <div class="logdetail ScrollBar" v-if="showCont">
      <el-button class="backbutton" type="info" icon="el-icon-back" plain @click="backLogList"></el-button>
      <LogCont></LogCont>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import LogCont from '@/components/logcont/LogCont.vue';
import { LogClient } from '@/util/clientHelper';

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
    if (this["$route"].query.id) {
      this.showCont = true;
    } else {
      this.showCont = false;
      let res: any;
      if (this.sortType === 'create') {
        res = await LogClient.getLogListByCTime(this.pageNo, this.pageSize);
      } else {
        res = await LogClient.getLogListByMTime(this.pageNo, this.pageSize);
      }
      this.totalNumber = res.data.totalNumber;
      this.list = res.data.list;
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
    this["$router"].push({ // 点击节点就改路由
      query: {
        id: btoa(encodeURIComponent(id))
      }
    });
    this.showCont = true;
  }

  // 返回日志列表
  async backLogList() {
    this['$router'].push({ query: {} });
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
      >ul {
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
          >div {
            >span {
              margin: 0 15px;
            }
          }
          .title {
            font-size: 14px;
          }
          .author, .time {
            color: #ccc;
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
      height: calc(100% - 44px);
      padding: 22px 0;
      .backbutton {
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
    height: 100%;
    .loglist {
      width: 100%;
      height: 92%;
      padding-top: 11px;
      >h3 {
        font-size: 17px;
      }
      .option {
        position: fixed;
        bottom: 5px;
        right: 5px;
        .tabs {
          display: none;
        }
      }
      .addbutton {
        position: fixed;
        left: 5%;
        top: 80px;
        z-index: 2;
      }
      >ul {
        height: 93%;
        overflow-y: auto;
        margin-top: 15px;
        padding: 0 10px;
        border-top: 1px solid rgba(204,204,204,0.4);
        border-bottom: 1px solid rgba(204,204,204,0.4);
        box-sizing: border-box;
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
    .logdetail {
      padding: 22px 5px 0;
      .backbutton {
        width: 40px;
        height: 40px;
        padding: 0;
        position: fixed;
        left: 5px;
        bottom: 5px;
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
