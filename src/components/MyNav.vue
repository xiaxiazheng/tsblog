<template>
  <header class="mynav">
    <div>
      <div class="leftside">
        <span @click="clickTabs('HomeMain')">
          {{ titlehome }}
        </span>
      </div>
      <div class="rightside">
        <!-- 搜索框 -->
        <div class="searchbox">
          <el-input
            v-model="keyword"
            placeholder="搜索树的节点"
            prefix-icon="el-icon-search"
            @focus="handleSearch"
            @blur="isSearch = false"
            clearable></el-input>
          <transition name="slide-fade">
            <ul v-if="keyword !== '' && isSearch" class="searchtree ScrollBar">
              <li v-if="searchList.length === 0">
                <span class="tips">暂无搜索结果</span>
              </li>
              <li v-else v-for="(item, index) of searchList" :key="index" @click="choiceSearch(item)">
                <div class="item">
                  <span class="label">{{ item.c_label }}</span>
                  <span class="flabel">{{ item.f_label }}（{{item.category}}）</span>
                </div>
              </li>
            </ul>
          </transition>
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
  activeTab: string = '';
  keyword: string = '';
  timer: number = 0;
  // 搜索
  isSearch: boolean = false;
  searchList: any[] = [];

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  init() {
    if (baseEnv === "productionPig") {
      this.titlehome = "燕苹的小站";
      this.titleadmin = "猪猪的小站";
    }
    this.activeTab = this.$route.name || '';  // 刷新页面时初始化高亮的 tab
  }

  // 点击选择模块
  clickTabs(tabName: any) {
    let pushname = this.type !== 'admin' ? tabName : `Admin${tabName}`;
    this.$router.push({ name: pushname });
    this.activeTab = pushname;
  }

  // 搜索
  @Watch('keyword')
  handleSearch() {
    if (this.keyword && this.keyword !== '') {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(
        async () => {
          let res = await TreeHelper.searchTree(this.keyword);
          if (res) {
            this.searchList = res;
            this.isSearch = true;
          }
        },
        500
      );
    } else {
      this.isSearch = false;
    }
  }

  // 点击已选择的项
  choiceSearch(item: any) {
    this.isSearch = false;
    if (this.type === 'home') {
      this.$router.replace({
        name: "Tree",
        query: {
          id: btoa(encodeURIComponent(item.c_id)),
          isSearch: 'true'
        }
      });
    }
    if (this.type === 'admin') {
      this.$router.replace({
        name: "AdminTree",
        query: {
          id: btoa(encodeURIComponent(item.c_id)),
          isSearch: 'true'
        }
      });
    }
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
          .el-input {
            line-height: 1;
            .el-input__inner {
              height: 34px;
              line-height: 34px;
            }
            .el-input__icon {
              line-height: 1;
            }
          }
          .searchtree {
            position: absolute;
            top: 38px;
            left: 0;
            width: 232px;
            height: auto;
            max-height: 350px;
            border: 1px solid #dcdfe6;
            box-sizing: border-box;
            border-radius: 4px;
            background-color: white;
            >li {
              padding: 2px 5px;
              line-height: 1;
              text-align: left;
              border-bottom: 1px solid #e28e8e80;
              box-sizing: border-box;
              cursor: pointer;
              >.item {
                padding: 6px 0;
                .label {
                  display: block;
                  padding-bottom: 6px;
                  color: #606266;
                  font-size: 14px;
                  line-height: 1.2;
                }
                >span {
                  color: #d4abab;
                }
              }
              .tips {
                display: inline-block;
                height: 32px;
                line-height: 32px;
                padding-left: 5px;
                letter-spacing: 1px;
                font-size: 14px;
                color: #c0c4cc;
              }
            }
            >li:last-child {
              border-bottom: none;
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
        .slide-fade-enter-active {
          transition: all .3s ease;
        }
        .slide-fade-leave-active {
          transition: all .6s cubic-bezier(1.0, 0.5, 0.8, 1.0);
        }
        .slide-fade-enter, .slide-fade-leave-to {
          transform: translateY(-10px); /* 这个如果为正数，就是从下到上，为负从上到下，改成X控制左右 */
          opacity: 0;
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
        .searchbox {
          display: none;
        }
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
