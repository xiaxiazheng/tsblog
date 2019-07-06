<template>
  <div class="adminlog">
    <!-- 日志列表 -->
    <transition name="slide-fade">
      <div class="loglist ScrollBar" v-if="!showCont">
        <h3>所有日志</h3>
        <el-button class="addbutton1" title="新增富文本日志" type="info" icon="el-icon-plus" plain @click="addNewLog('richtext')"></el-button>
        <el-button class="addbutton2" title="新增markdown日志" type="info" icon="el-icon-plus" plain @click="addNewLog('markdown')"></el-button>
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
              <i class="isShowIcon el-icon-view" :class="{'isShow': item.isShow === 'true'}" @click.stop="isShowLog(item)"></i>
              <i class="deleteIcon el-icon-delete" @click.stop="deleteLog(item.title, item.author, item.log_id)"></i>
            </div>
          </li>
        </ul>
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

@Component({
  components: {
    LogCont,
    AdminLogCont
  },
})
export default class AdminLog extends Vue {
  list: object[] = [];
  showCont: boolean = false;
  isEdit: boolean = true;
  sortType: 'create' | 'modify' = 'modify';
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
        res = await LogHelper.getLogListAllByCTime(params);
      } else {
        res = await LogHelper.getLogListAllByMTime(params);
      }
      if (res) {
        this.totalNumber = res.totalNumber;
        this.list = res.list;
        console.log(this.list);
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
    await this.init();
  }
}
</script>

<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .adminlog {
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
      .addbutton1, .addbutton2 {
        position: fixed;
        left: 5%;
        top: 80px;
        z-index: 2;
      }
      .addbutton2 {
        top: 125px;
        margin-left: 0;
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
            width: calc(100% - 15rem);
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
            .author {
              color: #ccc;
            }
          }
          >div:last-child {
            width: 15rem;
            text-align: right;
            .time {
              color: #ccc;
            }
            .isShowIcon {
              margin: 0 0.5rem;
              font-size: 14px;
              color: #646f77;
              &:hover {
                color: #ff5722;
              }
            }
            .isShow {
              color: #409EFF;
            }
            .deleteIcon {
              font-size: 14px;
              color: #646f77;
              &:hover {
                color: #ff5722;
              }
            }
          }
        }
      }
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
