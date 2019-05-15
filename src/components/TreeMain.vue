<template>
  <div class="treemain" ref="treemain">
    <!-- 前台展示版 -->
    <div class="home" v-if="type === 'home'">
      <div>
        <h1>{{title}}</h1>
        <h2>{{cont}}</h2>
      </div>

      <div class="common">
        <!-- 搜索框 -->
        <el-input
          placeholder="搜索树的内容  用空格分隔关键字  请输入汉字字母或数字"
          prefix-icon="el-icon-search"
          v-model="searchkeyword">
        </el-input>
        <!-- 搜索结果 -->
        <div class="resultTitle" v-if="searchkeyword">
          搜索结果：(默认按修改时间倒序排列)
          <span v-if="!isSeaching">第 {{pageNo}} / {{ Math.ceil(totalNumber / pageSize) }} 页</span>
        </div>
        <div class="resultWait" v-if="searchkeyword && isSeaching">正在搜索中，请稍后</div>
        <div class="resultNo" v-if="searchkeyword && !isSeaching && (!nowContList || nowContList.length === 0)">暂无搜索结果</div>
        <!-- 树首页的默认展示 -->
        <div class="resultTitle" v-if="!searchkeyword">
          最近更新的五个节点：
        </div>
        <!-- 结果列表 -->
        <div class="searchResult" v-for="(item, index) in nowContList" :key="index">
          <div class="item" @click="handleSelect(item)">
            <h2>
              <span v-html="item.title" v-highlight></span>
              <span class="fatherlabel">( {{item.f_label}} -> {{item.c_label}} )</span>
              <span class="time">修改时间：{{item.mtime}}</span>
            </h2>
            <p v-html="item.cont" v-highlight></p>
          </div>
        </div>
        <!-- 页码 -->
        <el-pagination
          :current-page.sync="pageNo"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="totalNumber"
          v-if="nowContList && nowContList.length !== 0 && totalNumber !== 0">
        </el-pagination>
      </div>
    </div>

    <!-- 控制台版 -->
    <div class="admin" v-if="type === 'admin'">
      <div>
        <h1>{{title}}</h1>
        <h2>{{cont}}</h2>
      </div>

      <div class="common">
        <!-- 搜索框 -->
        <el-input
          placeholder="搜索树的内容  用空格分隔关键字  请输入汉字字母或数字  这个能搜到'My Secret Place'的内容"
          prefix-icon="el-icon-search"
          v-model="searchkeyword">
        </el-input>
        <!-- 搜索结果 -->
        <div class="resultTitle" v-if="searchkeyword">
          搜索结果：(默认按修改时间倒序排列)
          <span v-if="!isSeaching">第 {{pageNo}} / {{ Math.ceil(totalNumber / pageSize) }} 页</span>
        </div>
        <div class="resultWait" v-if="searchkeyword && isSeaching">正在搜索中，请稍后</div>
        <div class="resultNo" v-if="searchkeyword && !isSeaching && (!nowContList || nowContList.length === 0)">暂无搜索结果</div>
        <!-- 树首页的默认展示 -->
        <div class="resultTitle" v-if="!searchkeyword">
          最近更新的五个节点：
        </div>
        <!-- 结果列表 -->
        <div class="searchResult" v-for="(item, index) in nowContList" :key="index">
          <div class="item" @click="handleSelect(item)">
            <h2>
              <span v-html="item.title" v-highlight></span>
              <span class="fatherlabel">( {{item.f_label}} -> {{item.c_label}} )</span>
              <span class="time">修改时间：{{item.mtime}}</span>
            </h2>
            <p v-html="item.cont" v-highlight></p>
          </div>
        </div>
        <!-- 页码 -->
        <el-pagination
          :current-page.sync="pageNo"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="totalNumber"
          v-if="nowContList && nowContList.length !== 0">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { baseEnv } from '../config';
import { TreeContHelper } from '@/client/TreeContHelper';

interface TreeType {
  c_id: string;
  mtime: string;
  title: string;
  cont: string;
}
interface SearchParams {
  keywords: string[];
  pageNo: number;
  pageSize: number;
}

@Component
export default class TreeMain extends Vue {
  @Prop() type: any;

  baseEnv: string = baseEnv;  // 当前运行环境
  title: string = '树的首页';
  cont: string = '';
  pageNo: number = 1;  // 当前页码
  pageSize: number = 7;
  nowContList: TreeType[] = [];  // 当前页面的数组
  totalNumber: number = 1;  // 符合当前搜索条件的所有个数
  searchkeyword: string = '';  // 用户输入的关键字们
  keywords: string[] = [];  // 处理后的关键字数组（去掉空格并拆分后的）
  timer: number = 0;  // 防抖定时器
  isSeaching: boolean = false;

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  async init() {
    if (baseEnv === "productionPig") {
      this.title = "盛兴中英文学校";
      this.cont = "孩子要成才，请到盛兴来！";
    }

    /* 下面这一块实现的是 默认树首页显示最近修改的5个节点 */
    let params = {
      pageNo: 1,
      pageSize: 5
    };
    // if (this.keywords.length !== 0) {
    //   Vue.set(params, 'keywords', this.keywords);
    // }
    let res;
    if (this.type === "home") {
      res = await TreeContHelper.getAlmostCont(params);
    }
    if (this.type === 'admin') {
      res = await TreeContHelper.getAllCont(params);
    }
    let list = res.list;
    for (let item of list) {
      item.cont = item.cont.replace(/<br\/>/g, "\n");
      item.cont = item.cont.replace(/</g, "&lt;"); // html标签的<转成实体字符,让所有的html标签失效
      item.cont = item.cont.replace(/&lt;pre/g, "<pre"); // 把pre标签转回来
      item.cont = item.cont.replace(/pre>\n/g, "pre>"); // 把pre后面的空格去掉
      item.cont = item.cont.replace(/&lt;\/pre>/g, "</pre>"); // 把pre结束标签转回来
      item.cont = item.cont.replace(/  /g, "&nbsp;&nbsp;"); // 把空格转成实体字符，以防多空格被合并
      item.cont = item.cont.replace(/\n|\r\n/g, "<br/>"); // 把换行转成br标签
    }
    this.nowContList = list;
    this.totalNumber = 0;
  }

  // 处理搜索
  @Watch("searchkeyword")
  async handleSearch() {
    if (this.searchkeyword) {
      this.isSeaching = true;
      /* 先进行防抖操作 */
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(
        () => { 
          this.handleKeyWord.apply(this);
        },
        500
      );
    } else {
      await this.init();
    }
  }

  // 处理关键字
  handleKeyWord() {
    this.keywords = this.searchkeyword.split(' ').filter(item => item !== "");  // 去掉空格并去掉连续空格造成的东西
    if (this.keywords.length !== 0) {
      if (this.pageNo !== 1) {
        this.pageNo = 1;  // 页码变化就会去拿数据
      } else {
        this.getNowContList(); // 若页码始终为1则直接请求数据
      }
    } else { // 这里是为了分隔出只输入空格以致于没有关键字的情况
      this.isSeaching = false;
      this.nowContList = [];
    }
  }

  // 点击切换页码
  @Watch("pageNo")
  handlePageNo() {
    this.getNowContList();
  }

  // 请求数据
  async getNowContList() {
    let params = {
      keywords: this.keywords,
      pageNo: this.pageNo,
      pageSize: this.pageSize
    };
    let res;
    if (this.type === "home") {
      res = await TreeContHelper.getAlmostCont(params);
    }
    if (this.type === 'admin') {
      res = await TreeContHelper.getAllCont(params);
    }
    this.totalNumber = res.totalNumber;
    this.nowContList = [];
    this.handleRes(res.list);
  }

  // 处理请求到的数据
  handleRes(list: TreeType[]) {
    for (let item of list) {
      item.cont = item.cont.replace(/<br\/>/g, "\n");
      item.cont = item.cont.replace(/</g, "&lt;"); // html标签的<转成实体字符,让所有的html标签失效
      item.cont = item.cont.replace(/&lt;pre/g, "<pre"); // 把pre标签转回来
      item.cont = item.cont.replace(/pre>\n/g, "pre>"); // 把pre后面的空格去掉
      item.cont = item.cont.replace(/&lt;\/pre>/g, "</pre>"); // 把pre结束标签转回来
      item.cont = item.cont.replace(/  /g, "&nbsp;&nbsp;"); // 把空格转成实体字符，以防多空格被合并
      item.cont = item.cont.replace(/\n|\r\n/g, "<br/>"); // 把换行转成br标签
      // 关键字高亮
      for (let jtem of this.keywords) {
        let re = new RegExp(`${jtem}`, "gi"); // 创建正则表达式，主要是为了 / /i 这个匹配不区分大小写
        item.title = item.title.replace(re, `<span class='keyword'>${jtem}</span>`);
        item.cont = item.cont.replace(re, `<span class='keyword'>${jtem}</span>`);
      }
    }
    this.isSeaching = false;
    this.nowContList = list;
    // 调用父组件的方法，使父组件回到页面顶部
    this.$emit('scrollToTop');
  }
  
  // 点击搜索出来的待选
  handleSelect(item: any) {
    if (this.type === 'home' && this.$route["path"].indexOf("admintree") === -1) {
      this.$router.replace({
        name: "Tree",
        query: {
          id: btoa(encodeURIComponent(item.c_id)),
          isSearch: 'true',
          searchSort: item.sort
        }
      });
      // this.$router.replace({
      //   path: `tree?id=${btoa(encodeURIComponent(item.c_id))}&isSearch=true#${item.c_id}-${item.sort}`
      // })
      console.log('点击搜索结果', item);
    } else {
      this.$router.replace({
        name: "AdminTree",
        query: {
          id: btoa(encodeURIComponent(item.c_id)),
          isSearch: 'true',
          searchSort: item.sort
        }
      });
    }
  }
}
</script>

<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .treemain {
    height: 100%;
    .home, .admin {
      >div>h2 {
        border: none;
      }
      .common {
        .el-input {
          margin-top: .5rem;
        }
        .resultTitle {
          position: relative;
          margin: 1rem 0 .3rem 0;
          font-size: 1rem;
          color: #ccc;
          >span {
            position: absolute;
            right: 0;
            bottom: 0;
            font-size: .8rem;
          }
        }
        .resultWait, .resultNo {
          color: #ccc;
          margin: 1rem 0 1rem 2rem;
        }
        .searchBox {
          width: 80%;
          display: block;
          margin: 3rem auto 0;
        }
        .searchResult {
          .item {
            position: relative;
            max-height: 230px;
            overflow: hidden; 
            margin-bottom: 1rem;
            padding: 2px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-sizing: border-box;
            cursor: pointer;
            >h2 {
              height: 32px;
              line-height: 32px;
              padding: 0 .5rem;
              font-size: 1rem;
              border-bottom: 1px solid #eaecef;
              box-sizing: border-box;
              .fatherlabel {
                margin-left: .5rem;
                color: #d2d2e2;
              }
              .time {
                position: absolute;
                top: 5px;
                right: 10px;
                font-size: 12px;
                color: rgb(228, 222, 222);
              }
            }
            >p {
              overflow-y: auto;
              max-height: 178px;
              margin-top: 5px;
              padding: 5px;
              font-size: .9rem;
            }
            >p::-webkit-scrollbar {
              /*滚动条整体样式*/
              width: 7px; /* 高宽分别对应横竖滚动条的尺寸 */
              height: 7px;
            }
            >p::-webkit-scrollbar-thumb {
              /*滚动条里面小方块*/
              border-radius: 0.5rem;
              box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              background: #dcdfe6;
            }
            >p::-webkit-scrollbar-track {
              /*滚动条里面轨道*/
              box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              border-radius: 0.5rem;
              background: white;
            }
            .keyword {  // 关键字高亮
              background-color: yellow;
              color: black !important;
            }
          }
          .item:hover {
            border: 1px solid #409EFF;
            box-shadow: 0 0 5px #409EFF; 
          }
        }
        .el-pagination {
          text-align: right;
        }
      }
    }
  }
  // 这个搜索的弹出框在比较全局的地方
  .searchBoxPopper {
    li {
      line-height: normal;
      padding: 7px;
      .title {
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .cont {
        font-size: 12px;
        color: #b4b4b4;
      }
    }
  }  
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .treemain {
    height: 100%;
    .home, .admin {
      h1 {
        font-size: 17px;
      }
      >div>h2 {
        border: none;
      }
      .common {
        .el-input {
          margin-top: .5rem;
        }
        .resultTitle {
          position: relative;
          margin: 14px 0 6px 0;
          font-size: 14px;
          color: #ccc;
          >span {
            position: absolute;
            right: 0;
            bottom: 0;
            font-size: .8rem;
          }
        }
        .resultWait, .resultNo {
          color: #ccc;
          margin: 1rem 0 1rem 2rem;
        }
        .searchBox {
          width: 80%;
          display: block;
          margin: 3rem auto 0;
        }
        .searchResult {
          .item {
            position: relative;
            max-height: 230px;
            overflow: hidden; 
            margin-bottom: 8px;
            padding: 2px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-sizing: border-box;
            cursor: pointer;
            >h2 {
              height: 26px;
              line-height: 25px;
              padding-left: 4px;
              font-size: 14px;
              overflow: hidden;
              border-bottom: 1px solid #eaecef;
              box-sizing: border-box;
              .fatherlabel {
                font-size: 12px;
                margin-left: .5rem;
                color: #d2d2e2;
              }
              .time {
                display: none;
              }
            }
            >p {
              overflow-y: auto;
              max-height: 178px;
              margin-top: 5px;
              padding: 5px;
              font-size: 12px;
            }
            >p::-webkit-scrollbar {
              /*滚动条整体样式*/
              width: 7px; /* 高宽分别对应横竖滚动条的尺寸 */
              height: 7px;
            }
            >p::-webkit-scrollbar-thumb {
              /*滚动条里面小方块*/
              border-radius: 0.5rem;
              box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              background: #dcdfe6;
            }
            >p::-webkit-scrollbar-track {
              /*滚动条里面轨道*/
              box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              border-radius: 0.5rem;
              background: white;
            }
            .keyword {  // 关键字高亮
              background-color: yellow;
              color: black !important;
            }
          }
          .item:hover {
            border: 1px solid #409EFF;
            box-shadow: 0 0 5px #409EFF; 
          }
        }
        .el-pagination {
          text-align: right;
        }
      }
    }
  }
  // 这个搜索的弹出框在比较全局的地方
  .searchBoxPopper {
    li {
      line-height: normal;
      padding: 7px;
      .title {
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .cont {
        font-size: 12px;
        color: #b4b4b4;
      }
    }
  }
}
</style>