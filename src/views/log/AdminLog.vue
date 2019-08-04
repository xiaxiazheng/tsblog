<template>
  <div class="adminlog">
    <!-- 日志列表 -->
    <transition name="slide-fade">
      <div class="loglist ScrollBar" v-if="!showCont">
        <h3>所有日志</h3>
        <el-button class="addbutton1" title="新增富文本日志" type="info" icon="el-icon-plus" plain @click="addNewLog('richtext')"></el-button>
        <el-button class="addbutton2" title="新增 markdown 日志" type="info" icon="el-icon-plus" plain @click="addNewLog('markdown')"></el-button>
        <div class="option">
          <div class="tabs">
            <span :class="{'active': sortType === 'create'}" @click="sortType='create'">按创建时间</span>
            <span :class="{'active': sortType === 'modify'}" @click="sortType='modify'">按修改时间</span>
            <span :class="{'active': isShowVisible === true }" @click="isShowVisible=!isShowVisible">显示可见</span>
            <span :class="{'active': isShowInvisible === true }" @click="isShowInvisible=!isShowInvisible">显示私密</span>
          </div>
          <!-- 日志搜索框 -->
          <LogSearch type="admin"></LogSearch>
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
        <ul class="log-list" v-if="list.length !== 0">
          <li
            v-for="(item, index) of list"
            :key="index"
            @click="choiceLog(item.log_id)"
            :class="{'stick-item': item.isStick === 'true'}">
            <div>
              <span class="title" :title="item.title">{{item.title}}</span>
              <span class="author" :title="item.author">{{item.author}}</span>
            </div>
            <div>
              <span class="time" v-if="sortType === 'create'">创建时间：{{item.cTime}}</span>
              <span class="time" v-if="sortType === 'modify'">修改时间：{{item.mTime}}</span>
              <i title="置顶" class="isStickIcon el-icon-star-off" :class="{'isStick': item.isStick === 'true'}" @click.stop="isStickLog(item)"></i>
              <i title="可见" class="isShowIcon el-icon-view" :class="{'isShow': item.isShow === 'true'}" @click.stop="isShowLog(item)"></i>
              <i title="删除" class="deleteIcon el-icon-delete" @click.stop="deleteLog(item.title, item.author, item.log_id)"></i>
            </div>
          </li>
        </ul>
        <div v-else class="noLogTips">暂无日志</div>
      </div>
    </transition>
    <!-- 日志详情 -->
    <div class="logdetail ScrollBar" v-if="showCont">
      <el-switch
        v-model="isEdit"
        title="是否编辑">
      </el-switch>
      <!-- 切换以下两个 -->
      <LogCont v-if="!isEdit" :backLogList="backLogList"></LogCont>
      <AdminLogCont v-if="isEdit" :backLogList="backLogList"></AdminLogCont>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import LogCont from '@/components/logcont/LogCont.vue';
import AdminLogCont from '@/components/logcont/AdminLogCont.vue';
import { LogHelper } from '@/client/LogHelper';
import LogSearch from '@/components/logcont/LogSearch.vue';

@Component({
  components: {
    LogCont,
    AdminLogCont,
    LogSearch
  },
})
export default class AdminLog extends Vue {
  list: object[] = [];
  showCont: boolean = false;
  isEdit: boolean = true;
  sortType: 'create' | 'modify' = 'modify';
  isShowVisible: boolean = true;
  isShowInvisible: boolean = true;
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
      if (this.isShowInvisible && this.isShowVisible) {  // 全部日志
        if (this.sortType === 'create') {
          res = await LogHelper.getLogListAllByCTime(params);
        } else {
          res = await LogHelper.getLogListAllByMTime(params);
        }
      } else if (this.isShowVisible) {  // 可见日志
        if (this.sortType === 'create') {
          res = await LogHelper.getLogListShowByCTime(params);
        } else {
          res = await LogHelper.getLogListShowByMTime(params);
        }
      } else if (this.isShowInvisible) {  // 不可见日志
        if (this.sortType === 'create') {
          res = await LogHelper.getLogListUnShowByCTime(params);
        } else {
          res = await LogHelper.getLogListUnShowByMTime(params);
        }
      } else {
        res = {
          totalNumber: 0,
          list: []
        };
      }

      if (res) {
        this.totalNumber = res.totalNumber;
        this.list = res.list;
      }
    }
  }

  @Watch('$route')
  onRouteChanged() { // 路由变化要监听~
    this.init();
  }

  // 切换显示可见或不可见或全部
  @Watch("isShowVisible")
  @Watch("isShowInvisible")
  hangleIsShowAll() {
    this.pageNo === 1 ? this.init() : this.pageNo = 1;
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

  // 是否置顶某篇 log
  async isStickLog(item: any) {
    let params = {
      id: item.log_id,
      isStick: item.isStick === 'true' ? 'false' : 'true'
    };
    let res = await LogHelper.isStickLog(params);
    if (res) {
      this.$message.success('修改置顶状态成功');
      this.pageNo === 1 ? this.init() : this.pageNo = 1;
    } else {
      this.$message.error('修改置顶状态失败');
    }
  }

  // 是否展示某篇 log
  async isShowLog(item: any) {
    let params = {
      id: item.log_id,
      isShow: item.isShow === 'true' ? 'false' : 'true'
    };
    let res = await LogHelper.isShowLog(params);
    if (res) {
      this.$message.success('修改显示状态成功');
      this.pageNo === 1 ? this.init() : this.pageNo = 1;
    } else {
      this.$message.error('修改显示状态失败');
    }
  }

  // 新建一篇日志
  async addNewLog(type: 'richtext' | 'markdown') {
    let params = {
      edittype: type
    };
    let res = await LogHelper.addLogCont(params);
    if (res) {
      this.$message.success('新建成功');
      this.pageNo === 1 ? this.init() : this.pageNo = 1;
    } else {
      this.$message.error('新建失败');
    }
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

  // 删除一篇日志
  deleteLog(title: string, author: string, id: string) {
    this.$confirm(`你将删除“ ${author} ” 写的 “ ${title} ”, 你确定?'`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      let params = {
        id
      };
      let res: any = await LogHelper.deleteLogCont(params);
      if (res) {
        this.$message.success('删除成功');
        this.init();
      } else {
        this.$message.error('删除失败');
      }
    }).catch(() => {
      this.$message.info('已取消删除');
    });
  }

  // 返回日志列表
  async backLogList() {
    this.$router.push({ query: {} });
    // await this.init(); 上面监听了路由变化，会自动更新列表
  }
}
</script>

<style lang="less">
@import '../../static/less/logList.less';

@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .adminlog {
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
  .adminlog {
    width: 100%;
    overflow: hidden;
    .loglist {
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
