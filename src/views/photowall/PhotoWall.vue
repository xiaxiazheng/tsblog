<template>
  <div class="photowall">
    <div>
      <el-upload
        action="#"
        name="image"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :file-list="imgUrllist">
        <i class="el-icon-plus"></i>
      </el-upload>
      <!-- 查看大图的 dialog -->
      <el-dialog width="40%" :visible.sync="dialogVisible" :title="dialogImageName">
        <img width="100%" :src="dialogImageUrl" alt="">
        <span>{{ dialogCTime }}</span>
      </el-dialog>
    </div>
    <!-- <h1>瀑布流改造升级中</h1> -->
    <div class="masonry">
      <div class="column">
        <div class="item">
          <div class="item__content"> </div>
        </div> <!-- more items -->
      </div>
      <div class="column">
        <div class="item">
          <div class="item__content"> </div>
        </div> <!-- more items -->
      </div>
      <div class="column">
        <div class="item">
          <div class="item__content"> </div>
        </div> <!-- more items -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { ImgClient } from '../../util/clientHelper';
import { baseImgUrl } from "../../config";

interface ImgListType {
  img_id: string;
  imgname: string;
  filename: string;
  cTime: string;
  url: string;
}

@Component
export default class PhotoWall extends Vue {
  dialogImageName: string = "";
  dialogImageUrl: string = "";
  dialogCTime: string = "";
  dialogVisible: boolean = false;
  imgUrllist: ImgListType[] = [];

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  async init() {
    let res: any = await ImgClient.getImgList('wall');
    if (!res) return;
    if (res.data.length !== 0) {
      for (let item of res.data) {
        this.imgUrllist.push({
          img_id: item.img_id,
          imgname: item.imgname,
          filename: item.filename,
          cTime: item.cTime,
          url: `${baseImgUrl}/wall/${item.filename}`
        });
      }
    }
  }

  handlePictureCardPreview(file: any) {
    this.dialogImageUrl = file.url;
    this.dialogImageName = file.imgname;
    this.dialogCTime = file.cTime;
    this.dialogVisible = true;
  }
}
</script>

<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .photowall {
    height: 100%;
    .el-upload-list__item.is-success .el-upload-list__item-status-label {
      // 去掉右上角的绿勾勾
      display: none !important;
    }
    .el-upload-list--picture-card
      .el-upload-list__item-actions
      .el-upload-list__item-delete {
      // 去掉删除图片的字体图标
      display: none !important;
    }
    .el-upload--picture-card {
      // 去掉上传图片的框
      display: none !important;
    }
    .el-dialog {
      max-width: 800px;
      min-width: 400px;
    }
  }
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .photowall {
    overflow-y: auto;
    >div {
      padding-top: 15px;
    }
    .el-upload-list__item.is-success .el-upload-list__item-status-label {
      // 去掉右上角的绿勾勾
      display: none !important;
    }
    .el-upload-list--picture-card
      .el-upload-list__item-actions
      .el-upload-list__item-delete {
      // 去掉删除图片的字体图标
      display: none !important;
    }
    .el-upload--picture-card {
      // 去掉上传图片的框
      display: none !important;
    }
    .el-dialog {
      width: 99% !important;
    }
  }
}
</style>
