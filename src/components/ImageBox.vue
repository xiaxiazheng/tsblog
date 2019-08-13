<template>
  <div class="imageBox" @mouseleave="handleMouseout">
    <!-- 上传图片的组件 -->
    <el-upload
      class="avatar-uploader"
      list-type="picture-card"
      :name="type"
      :data="uploadData"
      :action="uploadUrl"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      >
      <img
        v-if="imageFileName"
        :src="imageUrl"
        class="avatar"
        @mouseenter="handleMouseover">
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
    <div v-if="imageFileName" v-show="isHover" class="wrapper">
      <i class="el-icon-document-copy" title="复制图片<img>标签" @click="copyImgTag"></i>
      <i class="el-icon-search" title="预览大图" @click="isPreviewImage=true"></i>
      <i class="el-icon-delete" title="删除图片" @click="handleRemove"></i>
    </div>
    <!-- 查看大图的 dialog -->
    <el-dialog class="previewImage" :visible.sync="isPreviewImage" :title="imageName">
      <img width="100%" :src="imageUrl" :alt="imageName" :title="imageName">
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { ImgHelper } from '@/client/ImgHelper';
import { baseUrl, baseImgUrl } from '../config';

@Component
export default class ImageBox extends Vue {
  @Prop() type: any;
  @Prop() otherId: any;
  @Prop() imageFileName?: any;
  @Prop() imageName?: any;
  @Prop() imageId?: any;
  @Prop() createTime?: any;
  @Prop({ type: Function }) initImageList: any;  // '新增'，'删除'后初始化图片列表

  imageUrl: string = '';  // 图片真实的 url
  uploadData: any = {};  // 上传附带的数据
  uploadUrl: string = '';  // 上传图片的 url
  isHover: boolean = false;
  // 预览
  isPreviewImage: boolean = false;

  mounted() {
    this.$nextTick(function () {
      this.uploadUrl = `${baseUrl}/${this.type}_upload`;
      this.imageUrl = this.imageFileName && this.imageFileName !== '' ? `${baseImgUrl}/${this.type}/${this.imageFileName}` : '';
      this.handleOtherIdChange();
    });
  }

  // 文件名变动更新 url
  @Watch("imageFileName")
  hangleFileName() {
    this.imageUrl = this.imageFileName && this.imageFileName !== '' ? `${baseImgUrl}/${this.type}/${this.imageFileName}` : '';
  }

  @Watch("other_id")
  handleOtherIdChange() {
    this.uploadData = {
      other_id: this.otherId
    };
  }

  handleMouseover() {
    this.isHover = true;
  }

  handleMouseout() {
    this.isHover = false;
  }

  copyImgTag() {
    const copyStr = `<img src="${this.imageUrl}" />`;
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', copyStr);
    input.select();
    document.execCommand('copy');
    this.$message({
      type: 'success',
      message: "复制图片路径成功",
      duration: 1000
    });
    document.body.removeChild(input);
  }

  beforeUpload(file: any) {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      this.$message.warning(`上传图片仅支持'image/jepg'以及'image/png'类型，暂不支持'${file.type}'类型`);
      return false;
    }
    return true;
  }

  handleSuccess() {
    this.$message({
      type: 'success',
      message: "上传成功",
      duration: 1000
    });
    this.initImageList();
  }

  handleError() {
    this.$message.error("上传失败");
  }

  // 删除图片后
  handleRemove() {
    this.$confirm(`此操作将永久删除该文件 ———— ${this.imageName}, 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      let params = {
        type: this.type,
        img_id: this.imageId,
        filename: this.imageFileName
      };
      let res = await ImgHelper.deleteImg(params);
      if (res) {
        this.$message.success('删除成功');
        await this.initImageList();
      } else {
        this.$message.error('删除失败');
      }
    }).catch(() => {
      this.$message({
        type: 'info',
        message: "已取消删除",
        duration: 1000
      });
    });
    return false;
  }
}
</script>

<style lang="less">
.imageBox {
  position: relative;
  display: inline-block;
  margin-right: 10px;
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    text-align: center;
  }
  .avatar {
    display: block;
    width: 100%;
    height: 100%;
  }
  .wrapper {
    position: absolute;
    top: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    >i {
      margin: 0.3rem;
      color: white;
      cursor: pointer;
      &:hover {
        color: #27e4cf;
      }
    }
  }
  .previewImage {
    text-align: center;
  }
}
</style>
