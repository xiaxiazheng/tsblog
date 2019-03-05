<template>
  <div class="admincont">
	  <div v-if="$route.query.id">
      <h1>{{title}}</h1>
			<ul>
				<li v-for="(item, index) in contObj.list" :key="index">
					<el-input v-model="item.title" placeholder="请输入内容"></el-input>
          <el-input
						type="textarea"
						:autosize="{ minRows: 3, maxRows: 15 }"
						placeholder="请输入内容"
						v-model="item.cont">
					</el-input>
					<!-- 左下角的各种控制按键 -->
					<div class="ctrlbox">
						<span class="iconbox">
							<el-button
								type="text"
								size="mini"
								@click="() => upCont(item, index)"
								v-if="index !== 0">
								<i class="el-icon-arrow-up"></i>
							</el-button>
							<el-button
								type="text"
								size="mini"
								@click="() => downCont(item, index)"
								v-if="index !== contObj.list.length - 1">
								<i class="el-icon-arrow-down"></i>
							</el-button>
							<el-button
								type="text"
								size="mini"
								@click="() => deleteCont(item, index)"
								v-if="contObj.list.length > 1">
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
					<div class="uploadtreecontimg">
						<el-upload
							:action="uploadUrl"
							name="treecont"
							list-type="picture-card"
							:data="{ 
								c_id: contObj.id,
							  sort: item.sort
							}"
							:on-preview="handlePictureCardPreview"
							:on-success="handleSuccess"
							:on-error="handleError"
							:before-remove="handleRemove"
							:file-list="item.filelist"
							:limit="1"
							:class="{'alreadyhasone': item.filename}">
								<i class="el-icon-plus"></i>
						</el-upload>
					</div>
				</li>
			</ul>
			<div class="button">
        <el-button type="primary" @click="addCont" icon="el-icon-plus"></el-button>
			</div>
			<div class="save">
				<el-button type="primary" @click="saveText" :disabled="!isModify" icon="el-icon-check"></el-button>
			</div>
			<!-- 查看大图的 dialog -->
			<el-dialog width="40%" :visible.sync="dialogVisible" :title="dialogImageName">
				<img width="100%" :src="dialogImageUrl" :alt="dialogImageName" :title="dialogImageName">
			</el-dialog>
		</div>
		<div v-else>
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

interface ContType {
  id: any;
  list: any[];
}

@Component({
  components: {
    TreeMain
  },
})
export default class AdminTreeCont extends Vue {
  @Prop() propsname: any;

  title: string = '';
  contObj: ContType = {
    id: '',
    list: []
  };
  isModify: boolean = true;
  // 图片相关
  imgUrllist: any[] = [];
  uploadUrl: string = `${baseUrl}/treecont_upload`;
  dialogVisible: boolean = false;
  dialogImageName: string = '';
  dialogImageUrl: string = '';

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
  onPropsnameChanged() { // 父组件用传过来的名称来表示该三级节点的状态，如果该节点被删除则要清路由
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

  // 子组件冒上来调用父组件的方法
  scrollToTop() {
    this.$emit('scrollToTop');
  }
  
  async init() {
    if (this.$route.query.id && this.$route.query.id !== '') {
      let id: any = decodeURIComponent(atob(<string>this.$route.query.id)); // 子节点的id
      let res1: any = await TreeHelper.getChildName(id);
      this.title = res1.length !== 0 ? res1[0].c_label : '';
      let res: any = await TreeContHelper.getNodeCont(id);
      if (!res) return;
      this.contObj = {
        id: res.id,
        list: []
      };
      for (let item of res.list) {
        // 处理文件名，treecont的图片名有点特殊，‘原来的名字+id+'.'+一个随机数+'.'+图片类型
        let imgname: string = '';
        if (item.filename) {
          let list = item.filename.split('.');
          let filetype = list[list.length - 1]; // 文件类型
          let randomNum = list[list.length - 2];
          let originname = item.filename.substr(0, item.filename.length - filetype.length - randomNum.length - 2 - decodeURIComponent(atob(<string>this.$route.query.id)).length);
          imgname = `${originname}.${filetype}`;
        }
        this.contObj['list'].push({
          imgname,
          cont: item.cont,
          createtime: item.createtime,
          motifytime: item.motifytime,
          sort: item.sort,
          title: item.title,
          filename: item.filename || '',
          filelist: item.filename ? [{
            filename: item.filename || '',
            imgname: imgname || '',
            url: item.filename ? `${baseImgUrl}/treecont/${item.filename}` : ''
          }] : [],
        });
      }
    }
  }

  // 新增节点
  async addCont() {
    let params = {
      id: decodeURIComponent(atob(<string>this.$route.query.id)), // 子节点的id
      sort: this.contObj['list'][this.contObj['list'].length - 1].sort
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
      othercTime: this.contObj['list'][index - 1].createtime,
      otherSort: this.contObj['list'][index - 1].sort,
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
      othercTime: this.contObj['list'][index + 1].createtime,
      otherSort: this.contObj['list'][index + 1].sort,
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
    for (let item of this.contObj['list']) {
      if (item.cont === '') {
        this.$message.warning('输入框可以为空，但文本域不能为空撒');
        return;
      }
    }
    let params: any = this.contObj;
    let res: any = await TreeContHelper.modifyNodeCont(params);
    if (res) {
      this.$message.success('编辑成功');
      setTimeout(() => { this.init(); }, 1000);
    } else {
      this.$message.error('编辑失败');
    }
  }

  /** 图片操作 */
  // 点击查看大图
  handlePictureCardPreview(file: any) {
    this.dialogImageUrl = file.url;
    this.dialogImageName = file.imgname;
    this.dialogVisible = true;
  }
  // 上传成功后
  handleSuccess(response: any, file: any, fileList: any) {
    this.$message.success("上传成功");
    this.init();
  }
  // 上传失败后
  handleError(err: any, file: any, fileList: any) {
    this.$message.error("上传失败");
    this.init();
  }
  // 删除图片后
  async handleRemove(file: any, fileList: any) {
    /* 如果不是服务器上的图片，就直接删除 */
    if (file.status === 'ready') {
      return true;
    }

    this.$confirm(`此操作将永久删除该文件${file.imgname}, 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      let params = {
        filename: file.filename
      };
      let res = await ImgHelper.deleteTreeContImg(params);
      if (res) {
        this.$message.success('删除成功');
      } else {
        this.$message.error('删除失败');
      }
    }).catch(() => {
      this.$message.info('已取消删除');
    });
    return false;
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
    h1 {
      margin-bottom: 10px;
		}
		>div >ul {
			width: 82.6%; /* 经过计算的，别乱改啊 */
			li {
				position: relative;
				text-align: right;
				margin-top: 5px;
				.el-input {  /* 标题 */
					margin-top: 10px;
				}
				.el-textarea {  /* 内容 */
					margin-top: 10px;
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
				.uploadtreecontimg {  /* 上传图片 */
					position: absolute;
					right: -157px;
					top: 10px;
					.alreadyhasone {
						width: 148px;
						.el-upload--picture-card {
						  display: none;
						}
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
			right: 4.5rem;
			bottom: 2rem;
    }
    .el-dialog {
      max-width: 800px;
      min-width: 400px;
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
        .uploadtreecontimg {  /* 上传图片 */
          text-align: left;
					.alreadyhasone {
						width: 148px;
						.el-upload--picture-card {
						  display: none;
						}
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
    .el-dialog {
      max-width: 800px;
      min-width: 400px;
    }
  }
}
</style>
