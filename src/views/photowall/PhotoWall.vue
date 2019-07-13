<template>
  <div class="photowall">
    <div class="photowall-main ScrollBar">
      <!-- 展示 -->
      <div class="wrap">
        <img
          v-for="(item, index) of imgUrllist"
          :title="item.imgname"
          :key="index"
          :src="item.url"
          :alt="item.imgname"
          @click="photoPreview(item)">
      </div>
      <!-- 预览 -->
      <el-dialog :visible.sync="dialogVisible" :title="dialogImageName">
        <img width="100%" :src="dialogImageUrl" alt="">
        <span class="createtime">{{ dialogCTime }}</span>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { ImgHelper } from '@/client/ImgHelper';
import { baseImgUrl } from "../../config";

interface ImgListType {
  img_id: string;
  imgname: string;
  filename: string;
  cTime: string;
  url: string;
  dataset: string;
}

@Component
export default class PhotoWall extends Vue {
  // 图片列表
  imgUrllist: ImgListType[] = [];
  loadedNumber: number = 0;
  // 预览
  dialogImageName: string = "";
  dialogImageUrl: string = "";
  dialogCTime: string = "";
  dialogVisible: boolean = false;

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  async init() {
    let res = await ImgHelper.getImgList('wall');
    if (res) {
      const loading = require('@/static/img/loading.gif');
      for (let item of res) {
        this.imgUrllist.push({
          img_id: item.img_id,
          imgname: item.imgname,
          filename: item.filename,
          cTime: item.cTime,
          dataset: `${baseImgUrl}/wall/${item.filename}`,
          url: loading
        });
      }
    }
    this.lazyLoadImage();
  }

  // 批量加载，每隔三秒加载六张
  lazyLoadImage() {
    if (this.loadedNumber < this.imgUrllist.length) {
      for (let i = 0; i < 6 && this.loadedNumber < this.imgUrllist.length; i++) {
        this.imgUrllist[this.loadedNumber].url = this.imgUrllist[this.loadedNumber].dataset;
        this.loadedNumber++;
      }
      setTimeout(
        () => {
          this.lazyLoadImage();
        },
        3000
      );
    }
  }

  photoPreview(file: any) {
    this.dialogImageUrl = file.url;
    this.dialogImageName = file.imgname;
    this.dialogCTime = file.cTime;
    this.dialogVisible = true;
  }
}
</script>

<style lang="less">

  .photowall {
    .photowall-main {
      width: calc(100% - 20px);
      height: calc(100% - 10px);
      padding: 5px 10px;
      // 展示
      .wrap {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        img {
          max-width: 100%;
          margin: 3px;
          padding: 1px;
          height: 200px;
          background: #b4cfec;
          flex-grow: 1;
          object-fit: cover;
          transition: .3s;
          cursor: pointer;
        }
        img:hover{
          transform: scale(1.05);
          z-index: 3;
        }
      }
      .wrap:after{
        display: block;
        content: '';
        flex-grow: 9999;
      }
      // 预览
      .el-dialog {
        >span {
          display: inline-block;
          margin-top: 6px;
          margin-top: 10px;
          color: #9dbbda;
        }
      }
    }
  }
</style>
