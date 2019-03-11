<template>
  <header class="mynav">
    <div>
      <div class="leftside">
        <span @click="clickTabs('Main')">
          {{ titlehome }}
        </span>
      </div>
      <div class="rightside">
        <!-- 搜索框 -->
        <div class="searchbox">
          <el-input v-model="keyword" placeholder="搜索树的节点" prefix-icon="el-icon-search" clearable></el-input>
          <ul v-if="keyword !== '' && isSearch" class="ScrollBar">
            <li v-for="(item, index) of searchList" :key="index" @click="choiceSearch(item)">
              <div class="item">
                <div class="label">{{ item.c_label }}</div>
                <span class="flabel">{{ item.f_label }}（{{item.category}}）</span>
              </div>
            </li>
          </ul>
        </div>
        <!-- 右边的 tabs 们 -->
        <span :class="{'active': activeTab === 'Tree' || activeTab === 'AdminTree'}" @click="clickTabs('Tree')">知识树</span>
        <span :class="{'active': activeTab === 'Log' || activeTab === 'AdminLog'}" @click="clickTabs('Log')">日志</span>
        <span :class="{'active': activeTab === 'PhotoWall' || activeTab === 'AdminPhotoWall'}" @click="clickTabs('PhotoWall')">图片墙</span>
        <a href="https://github.com/xiaxiazheng/myblog">
          GitHub
          <i class="el-icon-star-off"></i>
        </a>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { TreeHelper } from '@/client/TreeHelper';
import { baseEnv } from '../config';

interface TreeType {
  flabel: string;
  id: number;
  label: string;
}

@Component
export default class MyNav extends Vue {
  @Prop() type: any;

  titlehome: string = 'XIAXIAZheng';
  titleadmin: string = 'XIAXIAZheng';
  tree: TreeType[] = [];
  activeTab: string = '';
  keyword: string = '';
  timer: number = 0;
  // 搜索
  isSearch: boolean = false;
  searchList: any[] = [];

  mounted() {
    this.$nextTick(function () {
      if (baseEnv === "productionPig") {
        this.titlehome = "黄苹苹欢迎你的到来";
        this.titleadmin = "黄猪猪欢迎你的到来";
      }
      this.init();
      this.activeTab = this.$route.name || '';  // 刷新页面时初始化高亮的 tab
    });
  }

  async init() {
    let res: any = await TreeHelper.getTree('home');
    this.tree = [];
    if (res.length === 0) return;
    for (let item of res) {
      for (let jtem of item.children) {
        for (let ktem of jtem.children) {
          this.tree.push({
            id: ktem.id,
            flabel: `${item.label} -> ${jtem.label}`,
            label: ktem.label
          });
        }
      }
    }
  }

  // 点击选择模块
  clickTabs(tabName: any) {
    let name = this.type !== 'admin' ? tabName : `Admin${tabName}`;
    this.$router.push({ name: name });
    this.activeTab = name;
  }

  // 搜索
  @Watch('keyword')
  handleSearch() {
    if (this.keyword && this.keyword !== '') {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(async () => {
        let res = await TreeHelper.searchTree(this.keyword);
        if (res) {
          this.searchList = res;
          this.isSearch = true;
        }
      }, 500);
    } else {
      this.searchList = [];
    }
  }

  // 点击已选择的项
  choiceSearch(item: any) {
    this.isSearch = false;
    console.log(item);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .mynav {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 3;
    height: 3.6rem;
    padding: .7rem 1.5rem;
    line-height: 2.2rem;
    background-color: #fff;
    box-sizing: border-box;
    border-bottom: 1px solid #eaecef;
    >div {
      display: flex;
      justify-content: space-between;
      .leftside {
        >span {
          font-size: 1.3rem;
          font-weight: 600;
          color: #2c3e50;
          cursor: pointer;
        }
      }
      .rightside {
        .searchbox {
          position: relative;
          display: inline-block;
          >ul {
            position: absolute;
            top: 42px;
            left: 0;
            height: auto;
            max-height: 300px;
            border: 1px solid #dcdfe6;
            box-sizing: border-box;
            border-radius: 3px;
            background-color: white;
            >li {
              text-align: left;
              padding: 2px 5px;
              border-bottom: 1px solid #e28e8e80;
              cursor: pointer;
              >.item {
                .label {
                  font-size: 16px;
                }
                >span {
                  color: #ccc;
                }
              }
            }
            >li:hover {
              background-color: #b3e0f9;
            }
          }
        }
        >span {
          display: inline-block;
          height: 1.7rem;
          margin-left: 1.5rem;
          font-size: .9rem;
          cursor: pointer;
        }
        >span:hover {
          border-bottom: 2px solid #409eff;
        }
        .active {
          border-bottom: 2px solid #409eff;
        }
        >a {
          margin-left: 1.5rem;
          font-size: .9rem;
          text-decoration: none;
          color: black;
        }
      }
    }
  }
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .mynav {
    height: 38px;
    line-height: 40px;
    padding: 0 7px;
    color: white;
    background-color: #66b1ff;
    >div {
      display: flex;
      justify-content: space-between;
      .leftside {
        >span {
          font-size: 1.3rem;
          font-weight: 600;
          letter-spacing: 1px;
          cursor: pointer;
        }
      }
      .rightside {
        >span {
          display: inline-block;
          line-height: 24px;
          margin: 0 5px;
          font-size: 0.9rem;
        }
        >span:hover {
          border-bottom: 2px solid #409eff;
        }
        .active {
          border-bottom: 2px solid #409eff;
        }
        >a {
          display: none;
        }
      }
    }
  }
}
</style>
