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
      <el-dialog width="70%" :visible.sync="dialogVisible" :title="dialogImageName">
        <img width="100%" :src="dialogImageUrl" alt="">
        <span>{{ dialogCTime }}</span>
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
};

@Component
export default class PhotoWall extends Vue {
  // 图片列表
  imgUrllist: ImgListType[] = [];
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
      for (let item of res) {
        this.imgUrllist.push({
          img_id: item.img_id,
          imgname: item.imgname,
          filename: item.filename,
          cTime: item.cTime,
          url: `${baseImgUrl}/wall/${item.filename}`
        });
      }
      console.log(this.imgUrllist);
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
@splitWidth: 500px;

// @media screen and (min-width: @splitWidth) {
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
          color: #9dbbda;
        }
      }
    }
  }
// }

// 移动端
// @media screen and (max-width: @splitWidth) {
  
// }
</style>
