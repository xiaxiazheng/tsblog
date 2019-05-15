<template>
  <div class="admintree">
	  <!-- 左边的树 -->
    <transition name="slide-fade">
      <div class="lefttree ScrollBar" v-if="showTree || isPC">
        <el-tree
          ref="admintree"
          :data="tree"
          :props="defaultProps"
          node-key="id"
          :default-expanded-keys="expandedList"
          @node-click="handleClick"
          :expand-on-click-node="false">
          <span class="custom-tree-node" slot-scope="{ node, data }" @mouseover="node.data.hovering=true" @mouseout="node.data.hovering=false">
            <span :class="{ 'active': activeId === node.data.id }">{{ node.label }}</span>
            <span class="iconBox" v-if="node.data.hovering">
              <!-- 上移 -->
              <el-button type="text" size="mini" @click.stop="() => upordown(node, data, 'up')" v-if="node.previousSibling">
                <i class="el-icon-arrow-up"></i>
              </el-button>
              <!-- 下移 -->
              <el-button type="text" size="mini" @click.stop="() => upordown(node, data, 'down')" v-if="node.nextSibling">
                <i class="el-icon-arrow-down"></i>
              </el-button>
              <!-- 修改 -->
              <el-button type="text" size="mini" @click.stop="() => motify(node, data)">
                <i class="el-icon-edit-outline"></i>
              </el-button>
              <!-- 新增 -->
              <el-button type="text" size="mini" @click.stop="() => append(node, data)">
                <i class="el-icon-circle-plus-outline"></i>
              </el-button>
              <!-- 穿梭 -->
              <el-button type="text" size="mini" @click.stop="() => shuttle(node, data)" v-if="node.level !== 1">
                <i class="el-icon-upload"></i>
              </el-button>
              <!-- 删除 -->
              <el-button type="text" size="mini" @click.stop="() => remove(node, data)">
                <i class="el-icon-delete"></i>	
              </el-button>
            </span>
          </span>
        </el-tree>
      </div>
    </transition>
    <!-- 给移动端隐藏树用的 -->
    <div class="hidetree" @click="isShowTree" v-if="!isPC">
      <i v-if="showTree" class="el-icon-arrow-left"></i>
      <i v-if="!showTree" class="el-icon-arrow-right"></i>
    </div>
    <!-- 给移动端滚回页面上方 -->
    <div class="scrolltop" v-if="!isPC && !showTree">
      <i  @click="scrollToTop" class="el-icon-arrow-up"></i>
    </div>
		<!-- 右边的子组件 -->
		<div class="rightcont ScrollBar" ref="rightcont" v-if="!showTree || isPC">
      <!-- 切换按键 -->
			<el-switch v-model="isEdit" title="是否编辑"></el-switch>
			<!-- 切换以下两个 -->
      <AdminTreeCont v-if="isEdit" :propsname="propsname" @scrollToTop="scrollToTop"></AdminTreeCont>
			<TreeCont v-if="!isEdit" :propsname="propsname" @scrollToTop="scrollToTop"></TreeCont>
		</div>
		<!-- 修改节点名称的dialog -->
		<el-dialog class="editname" title="提示" :visible.sync="showEditDialog" width="30%" :before-close="handleCloseDialog">
			<span class="notice">{{notice}}</span>
			<el-input
        ref="editinput"
        v-model="motifyNode.newNodeName"
        placeholder="请输入内容"
        @keyup.native.enter="handleSaveNode"
        clearable></el-input>
			<span slot="footer" class="dialog-footer">
				<el-button @click="handleCloseDialog">取 消</el-button>
				<el-button type="primary" @click="handleSaveNode">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 穿梭更换父节点的dialog -->
		<el-dialog title="提示" :visible.sync="showShuttleDialog" width="30%" :before-close="handleCloseDialog">
			<span>请选择"{{shuttleChildLabel}}"要穿梭到的
				<span v-if="shuttleLevel === 2">一级</span>
				<span v-if="shuttleLevel === 3">二级</span>
				节点：
			</span>
			<el-select v-model="choiceFathId">
				<el-option
					v-for="(item, index) in fatherNodeList"
					:key="index"
					:label="item.data.label"
					:value="item.data.id">
				</el-option>
			</el-select>
			<span slot="footer" class="dialog-footer">
				<el-button @click="handleCloseDialog">取 消</el-button>
				<el-button type="primary" @click="handleSaveShuttle">确 定</el-button>
			</span>
		</el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import AdminTreeCont from '@/components/treecont/AdminTreeCont.vue';
import TreeCont from '@/components/treecont/TreeCont.vue';
import { TreeHelper } from '../../client/TreeHelper';

@Component({
  components: {
    AdminTreeCont,
    TreeCont
  },
})
export default class AdminTree extends Vue {
  tree: any[] = [];
  allNodelist: any[] = []; // 整棵树的节点和状态
  isEdit: boolean = false;  // 切换编辑版和展示版
  defaultProps = {
    children: 'children',
    label: 'label'
  };
  activeId: number = 0;  // 当前路由的id ，是三级节点 id
  // 传给子组件的名字
  propsname: string = '';
  // 保存当前默认展开的节点，不然一操作树init数据树就要折叠
  expandedList: any[] = [];
  /* 节点改名 */
  showEditDialog: boolean = false;
  motifyNode = {
    id: '',
    newNodeName: '',
    level: ''
  };
  notice: string = '';
  /* 子节点穿梭 */
  fatherNodeList: any[] = []; // 子节点上一级的所有节点
  showShuttleDialog: boolean = false;
  shuttleLevel: number = 0;
  originFathId: string = '';
  choiceFathId: string = '';
  shuttleChildId: string = '';
  shuttleChildLabel: string = '';
  // 移动端相关
  isPC: boolean = true;
  splitWidth: number =  500;
  showTree: boolean = true;

  mounted() {
    this.$nextTick(function () {
      this.isPC = window.innerWidth <= this.splitWidth ? false : true;
      console.log("isPC:", this.isPC);
      this.onWidthChange();
      if (this.$route.query.id) {
        this.activeId = parseInt(atob(<string>this.$route.query.id), 10);
        // 如果有id就做节点展开，起码刷新的时候要把当前的节点存起来展开
        this.expandedList.push(this.activeId);
      }
      this.init();
    });
  }

  async init() {
    this.tree = await TreeHelper.getTree('admin');
    // 给树设置 hover 属性
    this.addHoverProperty(this.tree);
  }

  // 递归添加 hovering 属性
  addHoverProperty(obj: any) {
    obj.forEach((item: any) => {
      Vue.set(item, 'hovering', false);
      if (item.children) {
        this.addHoverProperty(item.children);
      }
    });
  }

  @Watch("$route")
  onRouteChange() {
    if (this.$route.query.id) {
      this.activeId = parseInt(atob(<string>this.$route.query.id), 10);
    } else {
      this.expandedList = [];
      this.activeId = -1;
    }
    // 只有在搜索造成路由变化的时候，才会主动推进该数组
    if (this.$route.query.isSearch) {
      this.expandedList.push(this.activeId);
    }
    this.scrollToTop();
  }

  // 滚动到顶部，给子组件调用的
  scrollToTop() {
    let div = this.$refs.rightcont as HTMLDivElement;
    div.scrollTop = 0;
  }
    
  // 点击节点，三个参数分别为传递给 data 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身。
  handleClick(obj: any, node: any, component: any) {
    if (node.level === 3) { // 若是子节点则右边显示具体信息
      this.$router.push({ 
        query: {
          id: btoa(encodeURIComponent(node.data.id))
        }
      });
      this.propsname = node.data.label;
      // 移动端
      this.showTree = false;
      // 等页面挂载了再触发
      setTimeout(
        () => {
          this.scrollToTop();
        },
        0
      );
    }
  }

  // 新增节点
  async append(node: any, data: any) {
    let params: any = {
      level: node.level,
    };
    if (node.level === 3) {  // 若是子节点
      Vue.set(params, 'id', node.parent.data.id);
      Vue.set(params, 'label', node.parent.data.label);
      Vue.set(params, 'f_sort', node.parent.data.sort);
      Vue.set(params, 'category_id', node.data.category_id);
      let list = node.parent.data.children;
      Vue.set(params, 'c_sort', list[list.length - 1].sort);  // 传当前父节点的最后一个子节点的sort过去
    }
    if (node.level === 2) { // 若是父节点
      Vue.set(params, 'category_id', node.data.category_id);
      let list = node.parent.data.children;
      Vue.set(params, 'sort', list[list.length - 1].sort);  // 传最后一个父节点的sort过去
    }
    if (node.level === 1) { // 若是一大类
      let list = node.parent.data;
      Vue.set(params, 'sort', list[list.length - 1].sort);
    }
    let res = await TreeHelper.addTreeNode(params);
    if (res) {
      this.saveTreeExpend();  // 保存树节点折叠/展开信息
      await this.init();
      this.$message.success('新增成功');
    } else {
      this.$message.error('新增失败');
    }
  }

  // 删除节点
  async remove(node: any, data: any) {
    // 若是叶子节点
    if (node.level === 3) {
      this.$confirm(`你将删除的是三级节点${data.label}, 你确定?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let category_id: any = data.category_id;
        let parentId: any = node.parent.data.id;
        for (let i in this.tree) {
          if (category_id === this.tree[i].id) {
            for (let j in this.tree[i].children) {
              if (this.tree[i].children[j].id === parentId) {
                // 保证每个父节点至少有一个子节点
                let childlist = this.tree[i].children[j].children;
                if (childlist.length === 1) {
                  this.$message.error("只剩下一个三级节点了，不能删除");
                  return;
                }
                // 删除子节点
                let params = {
                  id: data.id,
                  level: node.level
                };
                let res = await TreeHelper.deleteTreeNode(params);
                if (res) {
                  this.saveTreeExpend();  // 保存树节点折叠/展开信息
                  await this.init();
                  this.$message.success('删除成功');
                  // 如果删除的是当前路由 id 的节点，就改变传给子组件的值，传字符串过去清除路由
                  if (data.id === parseInt(atob(<string>this.$route.query.id), 10)) {
                    this.propsname = '';
                  }
                } else {
                  this.$message.error('删除失败');
                }
              }
            }
          }
        }
      }).catch(() => {
        this.$message.info(`已取消删除 ${data.label}`);
      });
    }
    // 若是二级节点
    if (node.level === 2) {
      this.$confirm(`你将删除的是二级节点${data.label}, 你确定?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 保证至少有一个二级节点
        if (node.parent.data.children.length === 1) {
          this.$message.error("只剩下一个二级节点了，不能删除");
          return;
        }
        // 删除二级节点
        let params = {
          id: data.id,
          level: node.level
        };
        let res = await TreeHelper.deleteTreeNode(params);
        if (res) {
          this.saveTreeExpend();  // 保存树节点折叠/展开信息
          await this.init();
          this.$message.success('删除成功');
          // 改变传过去的值，清除路由
          this.propsname = '';
        } else {
          this.$message.error('删除失败');
        }
      }).catch(() => {
        this.$message.info(`已取消删除 ${data.label}`);
      });
    }
    // 若是一级节点
    if (node.level === 1) {
      this.$confirm(`你将删除的是一级节点${data.label}, 你确定?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 保证至少有一个一级节点
        if (node.parent.childNodes.length === 1) {
          this.$message.error("只剩下一个一级节点了，不能删除");
          return;
        }
        // 删除一级节点
        let params = {
          id: data.id,
          level: node.level
        };
        let res = await TreeHelper.deleteTreeNode(params);
        if (res) {
          this.saveTreeExpend(); // 保存树节点折叠/展开信息
          await this.init();
          this.$message.success('删除成功');
          // 改变传过去的值，清除路由
          this.propsname = '';
        } else {
          this.$message.error('删除失败');
        }
      }).catch(() => {
        this.$message.info(`已取消删除 ${data.label}`);
      });
    }
  }

  // 修改节点
  motify(node: any, data: any) {
    let level = node.level;
    if (level === 3) {
      this.notice = '修改三级节点名称：';
    }
    if (level === 2) {
      this.notice = '修改二级节点名称：';
    }
    if (level === 1) {
      this.notice = '修改一级节点名称：';
    }
    this.motifyNode = {
      id: data.id,
      level: node.level,
      newNodeName: data.label,
    };
    this.showEditDialog = true;
    // 等上面的盒子挂载到页面了才可以获取到
    setTimeout(
      () => {  /* 建立宏任务，等待当前事件循环结束以及渲染后，执行这个代码 */
        let editinput = this.$refs.editinput as HTMLDivElement;
        editinput.focus();  /* 使输入框获得焦点 */
      },
      0
    );
  }

  // 保存修改的节点名称
  async handleSaveNode() {
    if (this.motifyNode.newNodeName === '') {
      this.$message.warning('节点名称不能为空');
      return;
    }
    let params = {
      id: this.motifyNode.id,
      label: this.motifyNode.newNodeName,
      level: this.motifyNode.level,
    };
    let res: any = await TreeHelper.modifyTreeNode(params);
    if (res) {
      this.saveTreeExpend();  // 保存树节点折叠/展开信息
      await this.init();
      this.$message.success('修改成功');
      this.showEditDialog = false;
      // 如果被改名的节点id与当前路由的id相同，就要传递修改的值
      if (btoa(encodeURIComponent(this.motifyNode.id)) === this.$route.query.id) {
        this.propsname = this.motifyNode.newNodeName;  // 保证修改的值能直接传给子组件，因为改了值路由没变，子组件不会刷新
      }
      this.motifyNode.newNodeName = '';
    } else {
      this.$message.error('修改失败');
    }
  }

  // 穿梭节点
  shuttle(node: any, data: any) {
    this.fatherNodeList = [];
    if (node.parent.childNodes.length === 1) {
      this.$message.warning('当前节点的父节点只有这一个子节点，不能穿梭');
      return;
    }

    /* 找到所有父级节点 */
    this.fatherNodeList = node.parent.parent.childNodes;
    /* 保存穿梭等级 */
    this.shuttleLevel = node.level;
    /* 保存现场 */
    this.choiceFathId = node.parent.data.id;
    this.originFathId = this.choiceFathId;
    this.shuttleChildId = data.id;
    this.shuttleChildLabel = data.label;
    this.showShuttleDialog = true;
  }

  // 保存穿梭
  async handleSaveShuttle() {
    if (this.choiceFathId === this.originFathId) {
      this.$message.warning('当前所选与原来的相同');
      return;
    }
    let params: any = {};
    if (this.shuttleLevel === 2) {
      for (let item of this.tree) {  // 二级节点穿梭，就要到一级节点找穿梭到的节点
        if (item.id === this.choiceFathId) {
          params = {
            shuttleLevel: this.shuttleLevel,
            category_id: item.id,
            f_sort:  item.children[item.children.length - 1].sort + 1,
            f_id: this.shuttleChildId
          };
          break;
        }
      }
    }
    if (this.shuttleLevel === 3) {  // 三级节点穿梭，就要到二级节点找穿梭到的节点
      for (let item of this.tree) {
        let isfind = false;
        for (let jtem of item.children) {
          if (jtem.id === this.choiceFathId) {
            params = {
              shuttleLevel: this.shuttleLevel,
              fatherid: jtem.id,
              fatherlabel: jtem.label,
              fathersort: jtem.sort,
              newchildsort: jtem.children[jtem.children.length - 1].sort + 1,
              childid: this.shuttleChildId
            };
            isfind = true;
            break;
          }
        }
        if (isfind) {
          break;
        }
      }
    }
    let res: any = await TreeHelper.changeFather(params);
    if (res) {
      this.saveTreeExpend();
      await this.init();
      this.$message.success('穿梭成功');
      this.showShuttleDialog = false;
    } else {
      this.$message.error('穿梭失败');
    }
  }

  // 上移或下移
  async upordown(node: any, data: any, type: string) {
    let otherId: any = '';
    let otherSort: any = '';
    if (type === 'up') {
      otherId = node.previousSibling.data.id;
      otherSort = node.previousSibling.data.sort;
    } else if (type === 'down') {
      otherId = node.nextSibling.data.id;
      otherSort = node.nextSibling.data.sort;
    } else {
      this.$message.error('上下移动出错');
      return;
    }

    let params = {
      otherId,
      otherSort,
      level: node.level,
      thisId: node.data.id,
      thisSort: node.data.sort,
    };
    
    let res: any = await TreeHelper.changeSort(params);
    if (res) {
      this.saveTreeExpend();
      await this.init();
      this.$message.success(`${ type === 'up' ? '上移' : '下移' }成功`);
    } else {
      this.$message.success(`${ type === 'up' ? '上移' : '下移' }失败`);
    }
  }

  // 处理关闭 dialog
  handleCloseDialog() {
    this.showEditDialog = false;
    this.motifyNode = {
      id: '',
      newNodeName: '',
      level: ''
    };
    this.showShuttleDialog = false;
    this.shuttleChildId = '';
    this.shuttleChildLabel = '';
  }

  // 保存当前一二级节点们的展开状态
  saveTreeExpend() {
    // 获取树的 dom 节点
    const treedom: any = this.$refs.admintree;
    // 获取树的数组
    const treelist = treedom.$children;
    this.expandedList = [];
    // 保存一二级的展开状态就行了
    for (let item of treelist) {
      if (item.expanded) {  // 在一级节点展开的情况下才保存它下级节点的展开情况
        this.expandedList.push(item.node.data.id);
        for (let jtem of item.node.childNodes) {
          if (jtem.expanded) {  // 同理，在二级节点展开时才保存
            this.expandedList.push(jtem.data.id);
          }
        }
      }
    }
  }

  // 浏览器窗口变化触发事件，一变化就触发
  onWidthChange() {
    window.onresize = () => {
      this.isPC = window.innerWidth <= this.splitWidth ? false : true;
      console.log("isPC:", this.isPC);
    };
  }

  // 移动端隐藏树
  isShowTree() {
    this.showTree = !this.showTree;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .admintree {
    .lefttree {
      width: 20rem;
      vertical-align: top;
      .el-tree {
        padding: 10px 5px;
        .active {
          color: #409eff;
        }
      }
    }
    .rightcont {
      width: calc(100% - 20rem);
      border-left: 1px solid #eaecef;
      box-sizing: border-box;
      vertical-align: top;
      .admincont {
        width: 100%;
        padding: 3rem 0;
      }
      .treecont {
        width: 100%;
        padding: 3rem 0;
      }
      .el-switch {
        position: fixed;
        right: 30px;
        top: 80px;
        z-index: 2;
			}
    }
    .hiddentree {
      display: none;
    }
		.custom-tree-node {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: 14px;
			padding-right: 8px;
			.iconBox {
				position: absolute;
				right: 13px;
				padding-left: 6px;
				background-color: #f5f7fa;
				z-index: 2;
			}
		}
    .editname {
      .notice {
        width: 130px;
        text-align: right;
        vertical-align: middle;
      }
      .el-input {
        width: calc(100% - 130px);
        vertical-align: middle;
      }
    }
  }
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .admintree {
    .active {
      color: #409eff;
    }
		.custom-tree-node {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: 14px;
			padding-right: 8px;
			.iconBox {
				position: absolute;
				right: 13px;
				padding-left: 6px;
				background-color: #f5f7fa;
				z-index: 2;
			}
		}
		.rightcont {
			.el-switch {
        position: fixed;
        right: 17px;
        top: 50px;
        z-index: 2;
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
    .lefttree, .rightcont {
      width: 100%;
    }
    .hidetree, .scrolltop {
      position: absolute;
      bottom: 5px;
      left: 9px;
      opacity: 0.5;
      z-index: 2;
      padding: 15px 20px;
      background-color: white;
      border-radius: 3px;
      border: 1px solid #ccc;
    }
    .scrolltop {
      right: 9px;
      left: unset;
    }
  }
}
</style>
