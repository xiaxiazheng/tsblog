<template>
  <div class="uploadphotowall">
    <el-upload
      :action="uploadUrl"
      name="image"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-remove="handleRemove"
      :file-list="imgUrllist">
      <i class="el-icon-plus"></i>
    </el-upload>
    <!-- 查看大图的 dialog -->
    <el-dialog :visible.sync="dialogVisible" :title="dialogImageName">
      <img width="100%" :src="dialogImageUrl" alt="">
      <span class="createtime">{{ dialogCTime }}</span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { ImgHelper } from '@/client/ImgHelper';
import { baseUrl, baseImgUrl } from '../config';

@Component
export default class UploadPhotoWall extends Vue {
  @Prop() type: any; // 取值有 main 或 wall

  dialogImageName: string = '';
  dialogImageUrl: string = '';
  dialogCTime: string = '';
  dialogVisible: boolean = false;
  imgUrllist: any[] = [];
  uploadUrl: string = '';

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }
  
  async init() {
    this.uploadUrl = `${baseUrl}/${this.type}_upload`;
    let type = this.type;
    let res = await ImgHelper.getImgList(type);
    this.imgUrllist = [];
    for (let item of res) {
      this.imgUrllist.push({
        img_id: item.img_id,
        imgname: item.imgname,
        filename: item.filename,
        cTime: item.cTime,
        url: `${baseImgUrl}/${this.type}/${item.filename}`
      });
    }
  }

  // 点击查看大图
  handlePictureCardPreview(file: any) {
    this.dialogImageUrl = file.url;
    this.dialogImageName = file.imgname;
    this.dialogCTime = file.cTime;
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
  handleRemove(file: any, fileList: any) {
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
        type: this.type,
        img_id: file.img_id,
        filename: file.filename
      };
      let res = await ImgHelper.deleteImg(params);
      if (res) {
        this.$message.success('删除成功');
        this.init();
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

@media screen and (min-width: @splitWidth) {
  .uploadphotowall {
    height: 100%;
    .el-dialog {
      .createtime {
        margin-top: 10px;
      }
    }
  } 
}
@media screen and (max-width: @splitWidth) {
  .uploadphotowall {
    height: 100%;
    .el-dialog {
      width: 100%;
    }
  } 
}
</style>
