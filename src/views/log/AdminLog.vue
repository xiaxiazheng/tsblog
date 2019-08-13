<template>
  <div class="adminlog">
    <!-- 日志列表 -->
    <div class="logbox ScrollBar" v-show="!isShowCont">
      <!-- 新增日志按钮 -->
      <el-button class="addbutton1" title="新增富文本日志" type="info" icon="el-icon-plus" plain @click="addNewLog('richtext')"></el-button>
      <el-button class="addbutton2" title="新增 markdown 日志" type="info" icon="el-icon-plus" plain @click="addNewLog('markdown')"></el-button>
      <!-- 日志分类 -->
      <el-tabs type="border-card" v-model="activeClassification">
        <el-tab-pane v-for="(item, index) of logClassList" :key="index" :name="item">
          <!-- tab 头 -->
          <span slot="label" :title="item">
            <i v-if="item === mainClassName" class="el-icon-house"></i>
            {{item}}
            <i v-if="item !== mainClassName && activeClassification === item" class="el-icon-edit" @click="editClassName(item)"></i>
          </span>
          <!-- 日志操作选项 -->
          <div class="option">
            <div class="tabs">
              <span :class="{'active': orderBy === 'create'}" @click="orderBy='create'">按创建时间</span>
              <span :class="{'active': orderBy === 'modify'}" @click="orderBy='modify'">按修改时间</span>
              <span :class="{'active': isShowVisible === true }" @click="isShowVisible=!isShowVisible">显示可见</span>
              <span :class="{'active': isShowInvisible === true }" @click="isShowInvisible=!isShowInvisible">显示私密</span>
              <span
                v-if="activeClassification === mainClassName"
                :class="{'active': isShowNotClassify === true}"
                @click="isShowNotClassify=!isShowNotClassify">
                仅显示未分类
              </span>
            </div>
            <!-- 日志搜索框 -->
            <LogSearch type="admin" :classification="activeClassification"></LogSearch>
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
                <span class="title" :title="item.title">
                  {{item.title}}
                  <span class="classify" v-if="activeClassification === mainClassName && item.classification !== ''" :title="`分类：${item.classification}`">[ {{item.classification}} ]</span>
                </span>
                <span class="author" :title="`作者：${item.author}`">{{item.author}}</span>
                <span class="edittype" title="编辑类型">{{item.edittype === 'richtext' ? '（富文本文档）' : '（markdown）'}}</span>
                <span class="time" v-if="orderBy === 'create'">创建时间：{{item.cTime}}</span>
                <span class="time" v-if="orderBy === 'modify'">修改时间：{{item.mTime}}</span>
              </div>
              <!-- 日志操作图标们 -->
              <div class="log-operator">
                <!-- 分类 icon -->
                <i
                  :title="`${item.classification === '' ? '未分类' : `已分类：${item.classification}`}`"
                  class="isClassifyIcon el-icon-position" 
                  :class="{'isClassify el-icon-s-promotion': item.classification !== '', 'el-icon-position': item.classification === ''}"
                  @click.stop="showSwitchClassDialog(item)">
                </i>
                <!-- 置顶 icon -->
                <i
                  :title="`${item.isStick === 'true' ? '已' : '未'}置顶`" 
                  class="isStickIcon el-icon-thumb"
                  :class="{'isStick': item.isStick === 'true'}"
                  @click.stop="isStickLog(item)">
                </i>
                <!-- 可见 icon -->
                <i
                  :title="`${item.isShow === 'true' ? '' : '不'}可见`"
                  class="isShowIcon el-icon-view"
                  :class="{'isShow': item.isShow === 'true'}"
                  @click.stop="isShowLog(item)">
                </i>
                <!-- 删除 icon -->
                <i
                  title="删除" 
                  class="deleteIcon el-icon-delete" 
                  @click.stop="deleteLog(item.title, item.author, item.log_id)">
                </i>
              </div>
            </li>
          </ul>
          <div v-else class="noLogTips">暂无日志</div>            
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 选择框 -->
    <el-dialog
      title="提示"
      :visible.sync="isShowSwitchDialog"
      width="30%">
      <span>请选择该日志要切换到的分类：</span>
      <el-select
        v-model="switchClassName"
        filterable
        allow-create
        default-first-option
        placeholder="请选择日志分类">
        <el-option
          v-for="item in logClassList"
          :key="item"
          :label="item"
          :value="item">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowSwitchDialog = false">取 消</el-button>
        <el-button type="primary" @click="switchClassify">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 日志详情 -->
    <div class="logdetail ScrollBar" v-if="isShowCont">
      <el-switch
        v-model="isEditLog"
        title="是否编辑">
      </el-switch>
      <!-- 切换以下两个 -->
      <LogCont v-if="!isEditLog" :backLogList="backLogList"></LogCont>
      <AdminLogCont v-if="isEditLog" :backLogList="backLogList"></AdminLogCont>
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
  mainClassName: string = '所有日志';  // 常量，主要分类的名称
  logClassList: string[] = [];
  loglist: object[] = [];
  orderBy: 'create' | 'modify' = 'create';
  activeClassification: string = this.mainClassName;
  isShowCont: boolean = false;
  isEditLog: boolean = false;
  isShowVisible: boolean = true;
  isShowInvisible: boolean = true;
  isloadinglist: boolean = false;
  isShowNotClassify: boolean = false;
  // 切换分类
  isShowSwitchDialog: boolean = false;
  switchingLog: any = "";
  switchClassName: string = '';
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
      this.isShowCont = true;
    } else {
      // 获取日志分类
      // if (this.type === 'home') let res = await LogHelper.getHomeAllClass();
      let res = await LogHelper.getLogAllClass();
      this.logClassList = res || [];
      this.logClassList.unshift(this.mainClassName);
      await this.getLogList();
    }
  }

  // 获取日志列表
  @Watch('activeClassification')
  async getLogList() {
    this.isloadinglist = true;
    this.isShowCont = false;
    let res: any = false;
    let params: any = {
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      orderBy: this.orderBy
    };
    this.activeClassification !== this.mainClassName && (params.classification = this.activeClassification);
    this.activeClassification === this.mainClassName && this.isShowNotClassify && (params.classification = '');
    if (this.isShowInvisible && this.isShowVisible) {  // 全部日志
      res = await LogHelper.getLogListAll(params);
    } else if (this.isShowVisible) {  // 可见日志
      params.isVisible = true;
      res = await LogHelper.getLogListIsVisible(params);
    } else if (this.isShowInvisible) {  // 不可见日志
      params.isVisible = false;
      res = await LogHelper.getLogListIsVisible(params);
    } else {
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

  // 切换显示可见或不可见或全部
  @Watch("isShowVisible")
  @Watch("isShowInvisible")
  hangleIsShowAll() {
    this.pageNo === 1 ? this.getLogList() : this.pageNo = 1;
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

  // 切换是否“仅显示未分类”
  @Watch("isShowNotClassify")
  handleOnlyShowNotClassify() {
    this.pageNo === 1 ? this.getLogList() : this.pageNo = 1;
  }

  // 打开日志切换选择对话框
  showSwitchClassDialog(item: any) {
    this.switchClassName = item.classification === '' ? this.mainClassName : item.classification;
    this.isShowSwitchDialog = true;
    this.switchingLog = item;
  }

  // 日志切换分类
  async switchClassify() {
    let params = {
      id: this.switchingLog.log_id,
      className: this.switchClassName === this.mainClassName ? '' : this.switchClassName
    };
    let res = await LogHelper.switchLogClass(params);
    if (res) {
      this.$message.success('修改日志分类成功');
      this.isShowSwitchDialog = false;
      this.init();
    } else {
      this.$message.error('修改日志分类失败');
    }
  }

  // 编辑类别名称
  editClassName(item: string) {
    this.$prompt('请输入新的分类名称：', `修改分类名称“${item}”`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    }).then(async (obj: any) => {
      if (!obj.value || obj.value === '') {
        this.$message.warning('分类名称不能为空');
        return;
      }
      let params = {
        newClassName: obj.value,
        oldClassName: item
      };
      let res = await LogHelper.editClassName(params);
      if (res) {
        this.$message.success('修改成功');
        await this.init();
        this.activeClassification = obj.value;
      }
    }).catch(() => {
           
    });
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
      this.pageNo === 1 ? this.getLogList() : this.pageNo = 1;
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
      this.pageNo === 1 ? this.getLogList() : this.pageNo = 1;
    } else {
      this.$message.error('修改显示状态失败');
    }
  }

  // 新建一篇日志
  async addNewLog(type: 'richtext' | 'markdown') {
    let params = {
      edittype: type,
      classification: this.activeClassification === this.mainClassName ? '' : this.activeClassification
    };
    let res = await LogHelper.addLogCont(params);
    if (res) {
      this.$message.success('新建成功');
      this.pageNo === 1 ? this.getLogList() : this.pageNo = 1;
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
    this.isShowCont = true;
  }

  // 删除一篇日志
  deleteLog(title: string, author: string, id: string) {
    this.$confirm(`你将删除"${title}"'`, 'Are you sure?', {
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
        this.getLogList();
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
    .el-tabs {
      min-height: 600px;
    }
  }
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .adminlog {
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
