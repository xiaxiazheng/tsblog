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
        <img width="100%" :src="dialogImageUrl" :alt="dialogImageName">
        <el-button
          type="success"
          icon="el-icon-star-on"
          class="copy-icon"
          circle
          title="复制图片路径"
          @click="copy(dialogImageUrl)">
        </el-button>
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
  url: any;
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
      const error = require('@/static/img/imageNotFound.png');
      for (let i = this.loadedNumber; i < this.imgUrllist.length && i < this.loadedNumber + 6; i = i + 1) {
        let promise = this.preloadImage(this.imgUrllist[i].dataset);
        promise.then(
          (img: any) => {  // 图片顺利加载
            this.imgUrllist[i].url = img.src;
            this.loadedNumber = this.loadedNumber + 1;
          },
          () => {  // 图片加载失败，换成加载失败的图片
            this.imgUrllist[i].url = error;
            this.loadedNumber = this.loadedNumber + 1;
          }
        );
      }
      setTimeout(
        () => {
          this.lazyLoadImage();
        },
        3000
      );
    }
  }

  // 加载单张图片，promise 控制返回
  preloadImage(path: string) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve(image);
      };
      image.onerror = () => {
        reject();
      };
      image.src = path;
    });
  }

  photoPreview(file: any) {
    this.dialogImageUrl = file.dataset;
    this.dialogImageName = file.imgname;
    this.dialogCTime = file.cTime;
    this.dialogVisible = true;
  }

  copy(url: string) {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', url);
    input.select();
    document.execCommand('copy');
    this.$message({
      type: 'success',
      message: "复制图片路径成功",
      duration: 1000
    });
    document.body.removeChild(input);
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
          margin: 5px 6px;
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
        .copy-icon {
          position: absolute;
          top: 5px;
          left: 6px;
        }
      }
    }
  }
</style>
