<template>
  <header class="mynav">
    <!-- 展示版 -->
    <div v-if="type === 'home'">
      <div class="leftside">
        <span @click="clickTabs('HomeMain')">
          {{ titlehome }}
        </span>
      </div>
      <div class="rightside">
        <!-- 搜索框 -->
        <el-autocomplete
          class="searchBox"
          popper-class="searchBoxPopper"
          v-model="searchkeyword"
          :fetch-suggestions="querySearch"
          placeholder="搜索树的节点 空格分隔key"
          :trigger-on-focus="false"
          @select="handleSelect">
          <i
            class="el-icon-search el-input__icon"
            slot="suffix">
          </i>
          <template slot-scope="{ item }">
            <div :title="item.flabel + ' -> ' + item.label">
              <div class="label">{{ item.label }}</div>
              <span class="flabel">{{ item.flabel }}</span>
            </div>
          </template>
        </el-autocomplete>
        <!-- 右边的 tabs 们 -->
        <span class="tabItem" @click="clickTabs('Login')">登录</span>
        <span class="tabItem" :class="{'active': activeTab === 'Tree'}" @click="clickTabs('Tree')">知识树</span>
        <span class="tabItem" :class="{'active': activeTab === 'PhotoWall'}" @click="clickTabs('PhotoWall')">图片墙</span>
        <a href="https://github.com/xiaxiazheng/myblog">
          GitHub
          <i class="el-icon-star-off"></i>
        </a>
      </div>
    </div>
    
    <!-- 控制台版 -->
    <div v-if="type === 'admin'">
      <div class="leftside">
        <span @click="clickTabs('AdminMain')">
          {{ titleadmin }}
        </span>
      </div>
      <div class="rightside">
        <!-- 搜索框 -->
        <el-autocomplete
          class="searchBox"
          popper-class="searchBoxPopper"
          v-model="searchkeyword"
          :fetch-suggestions="querySearch"
          placeholder="搜索树的节点 空格分隔key"
          :trigger-on-focus="false"
          @select="handleSelect">
          <i
            class="el-icon-search el-input__icon"
            slot="suffix">
          </i>
          <template slot-scope="{ item }">
            <div :title="item.flabel + ' -> ' + item.label">
              <div class="label">{{ item.label }}</div>
              <span class="flabel">{{ item.flabel }}</span>
            </div>
          </template>
        </el-autocomplete>
        <!-- 右边的 tabs 们 -->
        <span class="tabItem" :class="{'active': activeTab === 'AdminTree'}" @click="clickTabs('AdminTree')">知识树</span>
        <span class="tabItem" :class="{'active': activeTab === 'AdminPhotoWall'}" @click="clickTabs('AdminPhotoWall')">图片墙</span>
        <a href="https://github.com/xiaxiazheng/myblog">
          GitHub
          <i class="el-icon-star-off"></i>
        </a>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TreeClient } from '../util/clientHelper';
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
  searchkeyword: string = '';

  mounted() {
    this.$nextTick(function () {
      if (baseEnv === "productionPig") {
        this.titlehome = "黄苹苹欢迎你的到来";
        this.titleadmin = "黄猪猪欢迎你的到来";
      }
      this.init();
    });
  }

  async init() {
    let res: any = await TreeClient.getTree('home');
    if (!res) return;
    this.tree = [];
    for (let item of res.data) {
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

  clickTabs(tabName: any) {
    this["$router"].push({ name: tabName });
    this.activeTab = tabName;
  }

  // 处理是否搜索
  querySearch(queryString: any, cb: any) {
    let results: TreeType[];
    if (!queryString) { // 没关键字就跳过
      results = this.tree;
    } else {
      let keywords: string[] = queryString.split(' '); // 去掉空格
      keywords = keywords.filter(item => item !== ""); // 去掉连续空格造成的东西
      results = this.tree;
      if (keywords.length !== 0) { // 没关键字就跳过
        for (let keyword of keywords) {
          results = results.filter(this.createFilter(keyword));
        }
      }
    }
    
    cb(results); // 调用 callback 返回建议列表的数据
  }

  // 处理搜索的筛选
  createFilter(keyword: any) {
    return (item: any) => {
      return (item.label.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 || item.flabel.toLowerCase().indexOf(keyword.toLowerCase()) !== -1);
    };
  }
  
  // 点击搜索出来的待选
  handleSelect(item: any) {
    if (this.type === 'home') {
      this["$router"].replace({
        name: "Tree",
        query: {
          id: btoa(encodeURIComponent(item.id))
        }
      });
    }
    if (this.type === 'admin') {
      this["$router"].replace({
        name: "AdminTree",
        query: {
          id: btoa(encodeURIComponent(item.id))
        }
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .mynav {
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
        .tabItem {
          display: inline-block;
          height: 1.7rem;
          margin-left: 1.5rem;
          font-size: .9rem;
          cursor: pointer;
        }
        .tabItem:hover {
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
        .searchBox {
          display: inline-block;
          vertical-align: middle;
        }
      }
    }
  }
  // 这个搜索的弹出框在比较全局的地方
  .searchBoxPopper {
    li {
      line-height: normal;
      padding: 7px;
      .label {
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .flabel {
        font-size: 12px;
        color: #b4b4b4;
      }
    }
  }
</style>
