<template>
  <div class="admincont">
	  <div v-if="$route.query.id" class="admincontent">
      <h1>{{title}}</h1>
			<ul>
				<li v-for="(item, index) in contList" :key="index">
					<!-- 小标题框 -->
          <el-input v-model="item.title" placeholder="请输入内容"></el-input>
          <!-- 文本输入框 -->
          <el-input
						type="textarea"
						:autosize="{ minRows: 3, maxRows: 15 }"
						placeholder="请输入内容"
						v-model="item.cont">
					</el-input>
					<!-- 左下角的各种控制按键 -->
					<div class="ctrlbox">
						<span class="iconbox">
              <!-- 上移按钮 -->
							<el-button type="text" size="mini" @click="() => upCont(item, index)" v-if="index !== 0">
								<i class="el-icon-arrow-up"></i>
							</el-button>
              <!-- 下移按钮 -->
							<el-button type="text" size="mini" @click="() => downCont(item, index)" v-if="index !== contList.length - 1">
								<i class="el-icon-arrow-down"></i>
							</el-button>
              <!-- 删除按钮 -->
							<el-button type="text" size="mini" @click="() => deleteCont(item, index)" v-if="contList.length > 1">
								<i class="el-icon-delete"></i>	
							</el-button>
						</span>
						<span class="time">
							创建时间：
							<span>{{item.createtime}}</span>
							&nbsp;&nbsp;&nbsp;&nbsp;
							修改时间：
							<span>{{item.motifytime}}</span>
						</span>
					</div>
          <!-- 上传图片的组件 -->
          <div class="imageList">
            <ImageBox
              type="treecont"
              :other_id="item.cont_id"
              :imageFileName="item.filename"
              :imageName="item.imgname"
              :imageId="item.img_id"
              :initImageList="initImageList">
            </ImageBox>
          </div>
				</li>
			</ul>
			<div class="button">
        <el-button type="primary" @click="addCont" icon="el-icon-plus"></el-button>
			</div>
			<div class="save">
				<el-button type="primary" @click="saveText" :disabled="!isModify" icon="el-icon-check"></el-button>
			</div>
		</div>
		<div class="treemainbox" v-else>
			<TreeMain type="admin" @scrollToTop="scrollToTop"></TreeMain>
		</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { TreeHelper } from '@/client/TreeHelper';
import { TreeContHelper } from '@/client/TreeContHelper';
import { ImgHelper } from '@/client/ImgHelper';
import { baseUrl, baseImgUrl } from '../../config';
import TreeMain from '@/components/TreeMain.vue';
import ImageBox from '@/components/ImageBox.vue';

interface ContType {
  id: any;
  list: any[];
}

@Component({
  components: {
    TreeMain,
    ImageBox
  },
})
export default class AdminTreeCont extends Vue {
  @Prop() propsname: any;

  title: string = '';
  cId: string = '';
  contList: any[] = [];
  isModify: boolean = true;

  mounted() {
    this.$nextTick(async function () {
      this.init();
      if (this.$route.query.id && this.$route.query.id !== '') {
        let id: any = decodeURIComponent(atob(<string>this.$route.query.id));
        let res: any = await TreeHelper.getChildName(id);
        this.title = res.length !== 0 ? res[0].c_label : '';
      }
    });
  }
  
  @Watch('propsname')
  onPropsnameChanged() {
    // 父组件用传过来的名称来表示该三级节点的状态，如果该节点被删除则要清路由
    if (this.propsname !== '') {
      this.title = this.propsname;
    } else {
      this.$router.push({ query: {} });
    }
  }

  @Watch('$route')
  onRouteChanged() {
    this.init();
  }
  
  async init() {
    if (this.$route.query.id && this.$route.query.id !== '') {
      // 获取当前内容节点的id
      this.cId = decodeURIComponent(atob(<string>this.$route.query.id));
      // 获取内容节点标题
      let res1: any = await TreeHelper.getChildName(this.cId);
      this.title = res1.length !== 0 ? res1[0].c_label : '';
      // 获取内容节点的内容列表
      let res: any = await TreeContHelper.getNodeCont(this.cId);
      if (!res) return;
      this.contList = [];
      for (let item of res) {
        this.contList.push({
          c_id: item.c_id,
          cont_id: item.cont_id,
          cont: item.cont,
          createtime: item.createtime,
          motifytime: item.motifytime,
          sort: item.sort,
          title: item.title,
          img_id: item.img_id || '',
          imgname: item.imgname || '',
          filename: item.filename || '',
        });
      }
    }
  }

  // 刷新图片列表
  initImageList() {
    this.init();
  }

  // 子组件冒上来调用父组件的方法
  scrollToTop() {
    this.$emit('scrollToTop');
  }

  // 新增节点
  async addCont() {
    let params = {
      id: decodeURIComponent(atob(<string>this.$route.query.id)), // 子节点的id
      sort: this.contList[this.contList.length - 1].sort
    };
    let res: any = await TreeContHelper.addNodeCont(params);
    if (res) {
      this.$message.success('新增成功');
      this.init();
    } else {
      this.$message.error('新增失败');
    }
  }

  // 删除节点
  async deleteCont(item: any, index: any) {
    this.$confirm(`你将删除“ ${item.title} ”, 你确定?'`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => { 
      let id = decodeURIComponent(atob(<string>this.$route.query.id)); // 子节点的id
      let sort = item.sort;
      let params = {
        id: decodeURIComponent(atob(<string>this.$route.query.id)), // 子节点的id
        sort: item.sort
      };
      let res: any = await TreeContHelper.deleteNodeCont(params);
      if (res) {
        this.$message.success('删除成功');
        this.init();
      } else {
        this.$message.error('删除失败');
      }
    }).catch(() => {
      this.$message.info('已取消删除');
    });
  }

  // 上移节点
  async upCont(item: any, index: any) {
    let params = {
      thiscTime: item.createtime,
      thisSort: item.sort,
      othercTime: this.contList[index - 1].createtime,
      otherSort: this.contList[index - 1].sort,
    };
    let res: any = await TreeContHelper.changeContSort(params);
    if (res) {
      this.$message.success('上移成功');
      this.init();
    } else {
      this.$message.error('上移失败');
    }
  }

  // 下移节点
  async downCont(item: any, index: any) {
    let params = {
      thiscTime: item.createtime,
      thisSort: item.sort,
      othercTime: this.contList[index + 1].createtime,
      otherSort: this.contList[index + 1].sort,
    };
    let res: any = await TreeContHelper.changeContSort(params);
    if (res) {
      this.$message.success('上移成功');
      this.init();
    } else {
      this.$message.error('上移失败');
    }
  }

  // 保存页面文本
  async saveText() {
    for (let item of this.contList) {
      if (item.cont === '') {
        this.$message.warning('输入框可以为空，但文本域不能为空撒');
        return;
      }
    }
    let params: any = {
      id: this.cId,
      list: this.contList
    };
    let res: any = await TreeContHelper.modifyNodeCont(params);
    if (!res) {
      this.$message.error('编辑失败');
    } else {
      this.$message.success(res);
    }
  }
}
</script>

<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .admincont {
		text-align: left;
    padding: 10px;
    .admincontent {
      width: 67%;
      margin: 0 auto;
      h1 {
        margin-bottom: 10px;
      }
      >ul {
        width: 82.6%; /* 经过计算的，别乱改啊 */
        li {
          position: relative;
          text-align: right;
          margin-top: 5px;
          // 小标题
          .el-input {
            margin-top: 10px;
          }
          // 内容输入框
          .el-textarea {
            margin-top: 10px;
            >textarea {
              display: inline-block;
              overflow:hidden;
              overflow-y: auto;
              height: 100%;
              resize: none;
            }
            >textarea::-webkit-scrollbar {
              /*滚动条整体样式*/
              width: 7px; /* 高宽分别对应横竖滚动条的尺寸 */
              height: 7px;
            }
            >textarea::-webkit-scrollbar-thumb {
              /*滚动条里面小方块*/
              border-radius: .5rem;
              box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              background: #dcdfe6;
            }
            >textarea::-webkit-scrollbar-track {
              /*滚动条里面轨道*/
              box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
              border-radius: .5rem;
              background: white;
            }
          }
          /* 控制栏 */
          .ctrlbox {
            position: relative;
            overflow: hidden;
            .iconbox {
              position: absolute;
              left: 0;
              top: -5px;
            }
            .time {
              float: right;
              color: #ccc;
            }
          }
          // 上传图片
          .imageList {
            position: absolute;
            top: 10px;
            right: -170px;
          }
        }
      }
      .button {
        margin-top: 20px;
        text-align: center;
      }
      .save {
        position: fixed;
        text-align: center;
        right: 4.5rem;
        bottom: 2rem;
      }
    }
    .treemainbox {
      width: 67%;
      margin: 0 auto;
    }
  }
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .admincont {
		text-align: left;
		padding: 10px;
    h1 {
      font-size: 17px;
      margin-bottom: 10px;
		}
		>div >ul {
			li {
				position: relative;
				text-align: right;
				margin-top: 5px;
				.el-input {  /* 标题 */
					margin-top: 10px;
				}
				.el-textarea {  /* 内容 */
          margin-top: 10px;
          >textarea {
            resize: none;
          }
				}
				.ctrlbox {  /* 控制栏 */
					position: relative;
					overflow: hidden;
					.iconbox {
						position: absolute;
						left: 0;
						top: -5px;
					}
					.time {
						float: right;
						color: #ccc;
					}
				}
			}
		}
		.button {
			margin-top: 20px;
			text-align: center;
		}
		.save {
			position: fixed;
			text-align: center;
			right: 9px;
      bottom: 50px;
      .el-button--primary {
        width: 34px;
        height: 36px;
        padding: 0;
      }
    }
  }
}
</style>
