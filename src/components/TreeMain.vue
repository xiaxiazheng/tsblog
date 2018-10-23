<template>
  <div class="treemain">
    <!-- 前台展示版 -->
    <div v-if="type === 'home'" class="home">
      <div>
        <h1>{{title}}</h1>
        <h2>{{cont}}</h2>
      </div>

      <div class="common">
        <!-- 搜索框 -->
        <el-autocomplete
          class="searchBox"
          popper-class="searchBoxPopper"
          v-model="searchkeyword"
          :fetch-suggestions="querySearch"
          placeholder="搜索树中的所有内容 用空格分隔关键字 加载较慢请稍后"
          :trigger-on-focus="false"
          :disabled="!isload"
          @select="handleSelect">
          <i
            class="el-icon-search el-input__icon"
            slot="suffix">
          </i>
          <template slot-scope="{ item }">
            <div :title="item.cont">
              <div class="title">{{ item.title }}</div>
              <span class="cont">{{ item.cont }}</span>
            </div>
          </template>
        </el-autocomplete>
      </div>
    </div>

    <!-- 控制台版 -->
    <div v-if="type === 'admin'" class="admin">
      <div>
        <h1>{{title}}</h1>
        <h2>{{cont}}</h2>
      </div>

      <div class="common">
        <!-- 搜索框 -->
        <el-autocomplete
          class="searchBox"
          popper-class="searchBoxPopper"
          v-model="searchkeyword"
          :fetch-suggestions="querySearch"
          placeholder="搜索树中的所有内容 用空格分隔关键字 加载较慢请稍后 这是控制台的可以搜索到'My Secret Place'下的内容"
          :trigger-on-focus="false"
          :disabled="!isload"
          @select="handleSelect">
          <i
            class="el-icon-search el-input__icon"
            slot="suffix">
          </i>
          <template slot-scope="{ item }">
            <div :title="item.cont">
              <div class="title">{{ item.title }}</div>
              <span class="cont">{{ item.cont }}</span>
            </div>
          </template>
        </el-autocomplete>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { baseEnv } from '../config';
import { ContClient } from '../util/clientHelper'

interface TreeType {
  c_id: string;
  title: string;
  cont: string;
}

@Component
export default class TreeMain extends Vue {
  @Prop() type: any;

  baseEnv: string = baseEnv;
  contList: any[] = [];
  title: string = '树的首页';
  cont: string = '施工中';
  searchkeyword: string = '';
  isload: boolean = false;

  mounted() {
    this.$nextTick(function () {
      if (baseEnv === "productionPig") {
        this.title = "盛兴中英文学校";
        this.cont = "孩子要成才，请到盛兴来！";
      }
      this.init();
    });
  }

  async init() {
    this.isload = false;
    if(this.type === 'home') {
      let res = await ContClient.getAlmostCont();
      this.contList = res.data;
      this.isload = true;
    }
    if(this.type === 'admin') {
      let res = await ContClient.getAllCont();
      this.contList = res.data;
      this.isload = true;
    }
  }

  // 处理是否搜索
  querySearch(queryString: any, cb: any) {
    let results: TreeType[];
    if (!queryString) { // 没关键字就跳过
      results = this.contList;
    } else {
      let keywords: string[] = queryString.split(' '); // 去掉空格
      keywords = keywords.filter(item => item !== ""); // 去掉连续空格造成的东西
      results = this.contList;
      if (keywords.length !== 0) { // 没关键字就跳过
        for (let keyword of keywords) {
          results = results.filter(this.createFilter(keyword))
        }
      }
    }
    
    cb(results); // 调用 callback 返回建议列表的数据
  }

  // 处理搜索的筛选
  createFilter(keyword: any) {
    return (item: any) => {
      return (item.title.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 || item.cont.toLowerCase().indexOf(keyword.toLowerCase()) !== -1);
    };
  }
  
  // 点击搜索出来的待选
  handleSelect(item: any) {
    if (this.type === 'home') {
      this["$router"].replace({
        name: "Tree",
        query: {
          id: btoa(encodeURIComponent(item.c_id))
        }
      });
    }
    if (this.type === 'admin') {
      this["$router"].replace({
        name: "AdminTree",
        query: {
          id: btoa(encodeURIComponent(item.c_id))
        }
      });
    }
  }
}
</script>

<style lang="less">
  .treemain {
    height: 100%;
    .admin {
      .common {
        .searchBox {
          width: 80%;
          display: block;
          margin: 3rem auto 0;
        }
      }
    }
    .home {
      h2 {
        border: none;
      }
      .common {
        .searchBox {
          width: 80%;
          display: block;
          margin: 3rem auto 0;
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
</style>