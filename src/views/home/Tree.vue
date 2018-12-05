<template>
  <div class="tree">
    <!-- PC端 -->
    <div v-if="isPC" class="PC">
      <div class="lefttree">
        <el-tree
          :data="tree"
          :props="defaultProps"
          node-key="id"
          :default-expanded-keys="defaultExpandedKeys"
          :highlight-current="true"
          @node-click="handleClick"
          accordion>
        </el-tree>
      </div>
      <div class="rightcont" ref="rightcont">
        <TreeCont @scrollToTop="scrollToTop"></TreeCont>
      </div>
    </div>
    <!-- 移动端 -->
    <div v-else class="Mobile">
      <div class="topMobile">
        <h1>{{ title }}</h1>
      </div>
      <div>
        <el-button 
          type="primary" 
          icon="el-icon-tickets"
          @click="isShowTree">
        </el-button>
      </div>
      <div class="leftMobile" v-show="showTree">
        <el-tree
          :data="tree"
          :props="defaultProps"
          @node-click="handleClick"
          node-key="id"
          accordion>
        </el-tree>
      </div>
      <div class="rightMobile">
        <TreeCont :isPC="isPC"></TreeCont>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { TreeClient } from '../../util/clientHelper';
import { isPC } from '../../config';
import TreeCont from '@/components/treecont/TreeCont.vue';

@Component({
  components: {
    TreeCont,
  },
})
export default class Tree extends Vue {
  // 移动端相关
  isPC: boolean = isPC;
  showTree: boolean = false;

  tree: any[] = [];
  defaultProps = {
    children: 'children',
    label: 'label'
  };
  defaultExpandedKeys: any = [];
  title: string = '虾虾郑的个人空间';


  mounted() {
    this.$nextTick(function () {
      this.init();
    });
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
    if (this["$route"].query.id) {  // 如果有id就做节点展开，起码刷新的时候要把当前的节点存起来展开
      this.defaultExpandedKeys = []; // 前台展示的话直接清空
      this.defaultExpandedKeys.push(parseInt(atob(<string>this["$route"].query.id), 10));
    }
    let res: any = await TreeClient.getTree('home');
    if (!res) return;
    this.tree = res.data;
  }

  handleClick(nodeObj: any, node: any, c: any) {
    let isLeaf = node.isLeaf;
    if (isLeaf) {
      this["$router"].push({ // 点击节点就改路由
        query: {
          id: btoa(encodeURIComponent(node.data.id))
        }
      });

      // 移动端
      this.showTree = false;
      this.title = node.data.label;
    }
  }

  isShowTree() {
    this.showTree = !this.showTree;
  }
}
</script>

<style lang="less" scoped>
  .tree {
    .PC {
      height: 100%;
    }
    // 移动端样式
    .Mobile {
      .topMobile {
        position: fixed;
        top: 0;
        width: 100%;
        height: 2.5rem;
        border-bottom: 1px solid #ccc;
        background-color: white;
        text-align: left;
        .el-button {
          width: 3.5rem;
          height: 2.5rem;
          margin-right: .4rem;
          text-align: center;
          vertical-align: middle;
        }
        h1 {
          display: inline-block;
          vertical-align: middle;
        }
      }
      .leftMobile {
        height: calc(100% - 2rem);
        position: fixed;
        top: 2.5rem;
        width: 65%;
        background-color: white;
        border: 1px solid #ccc;
        z-index: 2;
        overflow-y: auto;
      }
      .rightMobile {
        position: fixed;
        top: 2.5rem;
        height: calc(100% - 2rem);
        width: 100%;
        overflow-y: auto;
      }
    }
  }
</style>