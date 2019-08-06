// 日志搜索框
<template>
  <div class="logsearch">
    <!-- 搜索框 -->
    <el-input
      placeholder="搜索日志"
      prefix-icon="el-icon-search"
      clearable
      v-model="keyword"
      @focus="handleSearchLog"
      @blur="isSearch = false"
      >
    </el-input>
    <!-- 搜索结果 -->
    <transition name="slide-fade">
      <ul v-if="keyword !== '' && isSearch" class="searchresult ScrollBar">
        <li v-if="searchList.length === 0">
          <span class="tips">暂无搜索结果</span>
        </li>
        <li v-else v-for="(item, index) of searchList" :key="index" @click="choiceSearch(item)">
          <div class="item">
            <span class="title">{{ item.title }}</span>
          </div>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { LogHelper } from '@/client/LogHelper';

@Component
export default class LogSearch extends Vue {
  @Prop() type: any;
  @Prop() classification: any;
  @Prop({ type: Function }) backLogList: any;

  isSearch: boolean = true;
  keyword: string = '';
  searchList: string[] = [];
  timer: number = 0;

  @Watch('keyword')
  handleSearchLog() {
    if (this.keyword && this.keyword !== '') {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(
        async () => {
          let params: any = {
            keyword: this.keyword
          };
          this.classification !== '所有日志' && (params.classification = this.classification);
          let res = this.type === 'home' ?
            await LogHelper.searchHomeTree(params) : 
            await LogHelper.searchAdminTree(params);
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

  choiceSearch(item: any) {
    if (this.type === 'home') {
      this.$router.replace({
        name: "Log",
        query: {
          id: btoa(encodeURIComponent(item.log_id))
        }
      });
    }
    if (this.type === 'admin') {
      this.$router.replace({
        name: "AdminLog",
        query: {
          id: btoa(encodeURIComponent(item.log_id))
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
  .logsearch {
    position: relative;
    .el-input__inner {
      height: 28px;
      line-height: 28px;
    }
    .el-input__icon {
      line-height: 28px;
    }
    // 搜索结果
    .searchresult {
      position: absolute;
      width: 237px;
      height: auto;
      max-height: 300px;
      top: 31px;
      left: 0;
      border: 1px solid  #dcdfe6;
      border-radius: 5px;
      box-sizing: border-box;
      background: white;
      text-align: left;
      >li {
        padding: 5px;
        border-bottom: 1px solid #e28e8e80;
        font-size: 13px;
        cursor: pointer;
        &:last-child {
          border-bottom: none;
        }
        &:hover {
          background: #b3e0f9;
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
      transform: translateY(-10px); /* 这个如果为正数，就是从下到上，为负从上到下，改成X控制左右 */
      opacity: 0;
    }
  }  
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .logsearch {
    display: none;
  }  
}
</style>
