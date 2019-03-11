<template>
  <div class="homemain">
    <div class="carousel">
      <el-carousel :interval="5000" v-if="imgUrlList.length !== 0">
        <el-carousel-item v-for="(item, index) in imgUrlList" :key="index">
          <img :src="item" alt="">
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 这是个只有首页底部才会出现的 footer -->
    <footer>
      <div style="width:300px;margin:0 auto;">
		 		<a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44010602005623" style="display:inline-block;text-decoration:none;height:20px;line-height:20px;">
          <img src="~@/assets/beian.png"/>
          <span>粤公网安备 44010602005623号</span>
        </a>
		 	</div>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ImgHelper } from '@/client/ImgHelper';
import { baseImgUrl } from "../../config";

@Component
export default class HomeMain extends Vue {
  imgUrlList: any[] = [];

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  async init() {
    let res = await ImgHelper.getImgList('main');
    for (let item of res) {
      this.imgUrlList.push(`${baseImgUrl}/main/${item.filename}`);
    }
  }
}
</script>

<style lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .homemain {
    .carousel {
      height: calc(100% - 3.6rem);
      .el-carousel {
        height: 100%;
        .el-carousel__container {
          height: 100% !important;   
        }
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
    footer {
      display: flex;
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 3.6rem;
      line-height: 3.6rem;
      border-top: 1px solid #ccc;
      box-sizing: border-box;
      a {
        img {
          vertical-align: middle;
          margin-right: .2rem;
        }
        span {
          vertical-align: middle;
          color:#939393;
        }
      }
    }
  } 
}
// 移动端
@media screen and (max-width: @splitWidth) {
  .homemain {
    height: 100%;
    .carousel {
      max-width: 500px; // 走马灯宽度
      margin: 0 auto;
      .el-carousel__container {
        height: 203px !important;  // 走马灯高度 
      }
      img {
        width: 100%;
        height: 100%;
      }
    }
    footer {
      display: flex;
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 1.5rem;
      line-height: 1rem;
      border-top: 1px solid #ccc;
      box-sizing: border-box;
      a {
        img {
          vertical-align: middle;
          margin-right: .2rem;
        }
        span {
          vertical-align: middle;
          color:#939393;
        }
      }
    }
  } 
}
</style>