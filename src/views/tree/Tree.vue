<template>
  <div class="tree">
    <transition name="slide-fade">
      <div class="lefttree ScrollBar" v-if="showTree || isPC">
        <el-tree
          :data="tree"
          :props="defaultProps"
          node-key="id"
          :default-expanded-keys="defaultExpandedKeys"
          :highlight-current="true"
          @node-click="handleClick"
          accordion>
          <span class="custom-tree-node" slot-scope="{ node }">
            <span :class="{ 'active': activeId === node.data.id }">{{node.label}}</span>
            <!-- <span :class="{ 'active': activeId === node.data.id }">{{ node.label }}</span> -->
          </span>
        </el-tree>
      </div>
    </transition>
    <!-- 给移动端隐藏树用的 -->
    <div class="hidetree" @click="isShowTree" v-if="!isPC">
      <i v-if="showTree" class="el-icon-arrow-left"></i>
      <i v-if="!showTree" class="el-icon-arrow-right"></i>
    </div>
    <div class="rightcont ScrollBar" v-show="!showTree || isPC" ref="rightcont">
      <TreeCont @scrollToTop="scrollToTop"></TreeCont>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { TreeHelper } from '@/client/TreeHelper';
import TreeCont from '@/components/treecont/TreeCont.vue';

@Component({
  components: {
    TreeCont,
  },
})
export default class Tree extends Vue {
  tree: any[] = [];
  defaultProps = {
    children: 'children',
    label: 'label'
  };
  defaultExpandedKeys: any = [];
  activeId: number = 0;  // 叶子节点的 id，三级节点的
  // 移动端相关
  splitWidth: number = 500;
  showTree: boolean = true;
  isPC: boolean = true;
  // 用于防抖
  timer: number = 0;

  mounted() {
    this.$nextTick(function () {
      this.isPC = window.innerWidth <= this.splitWidth ? false : true;
      this.onWidthChange();
      this.init();
      // 手机端如果打开分享的树节点的链接，就判断 id 并隐藏树
      if (!this.isPC && this.$route.query.id) {
        this.showTree = false;
      }
    });
  }

  beforeDestroy() {
    window.onresize = null;
  }

  @Watch("$route")
  onRouteChanged() {
    this.init();
  }

  // 滚动到顶部，给子组件调用的
  scrollToTop() {
    let div = this.$refs["rightcont"] as HTMLDivElement;
    div["scrollTop"] = 0;
  }

  async init() {
    if (this.$route.query.id) {  // 如果有id就做节点展开，起码刷新的时候要把当前的节点存起来展开
      this.defaultExpandedKeys = []; // 前台展示的话直接清空
      this.activeId = parseInt(atob(<string>this.$route.query.id), 10);
      this.defaultExpandedKeys.push(this.activeId);
    }
    this.tree = await TreeHelper.getTree('home');
  }

  handleClick(nodeObj: any, node: any, c: any) {
    let isLeaf = node.isLeaf;
    if (isLeaf) {
      this.$router.push({ // 点击节点就改路由
        query: {
          id: btoa(encodeURIComponent(node.data.id))
        }
      });
      this.activeId = node.data.id;
      // 移动端
      this.showTree = false;
    }
  }

  // 浏览器窗口变化触发事件，一变化就触发
  onWidthChange() {
    window.onresize = () => {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(
        () => {
          this.isPC = window.innerWidth <= this.splitWidth ? false : true;
          console.log("isPC:", this.isPC);
        },
        500
      );
    };
  }

  // 移动端隐藏树
  isShowTree() {
    this.showTree = !this.showTree;
  }
}
</script>

<style lang="less" scoped>
@splitWidth: 500px;
// PC 端
@media screen and (min-width: @splitWidth) {
  .tree {
    height: 100%;
    .lefttree {
      width: 20rem;
      vertical-align: top;
      .el-tree {
        padding: 10px 5px;
        .custom-tree-node {
          font-size: 14px;
          .active {
            color: #409eff;
          }
        }
      }
    }
    .rightcont {
      width: calc(100% - 20rem);
      border-left: 1px solid #eaecef;
      box-sizing: border-box;
      vertical-align: top;
      .admincont {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem 2.5rem;
      }
      .treecont {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 2.5rem;
      }
    }
    .hiddentree {
      display: none;
    }
  } 
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .tree {
    position: relative;
    .lefttree, .rightcont {
      width: 100%;
    }
    .lefttree {
      width: 100%;
      vertical-align: top;
      .el-tree {
        padding: 10px 5px;
        .custom-tree-node {
          font-size: 14px;
          .active {
            color: #409eff;
          }
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
    .rightcont {
      width: 100%;
      vertical-align: top;
    }
    .hidetree {
      position: absolute;
      bottom: 5px;
      left: 9px;
      opacity: 0.7;
      z-index: 2;
      padding: 15px 20px;
      background-color: white;
      border-radius: 3px;
      border: 1px solid #ccc;
    }
  }
}
</style>