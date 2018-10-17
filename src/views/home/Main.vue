<template>
  <div class="main">
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
import { imgClient } from '../../util/clientHelper';
import { baseUrl } from "../../config";

@Component
export default class Main extends Vue {
  imgUrlList: any[] = [];

  mounted() {
    this.$nextTick(function() {
      this.init();
    });
  }

  async init() {
    let self = this,
        params = {
          type: 'main'
        };
    let res = await imgClient.getImgList('type');
    if(!res) return;
    for(let item of res.data) {
      this.imgUrlList.push(baseUrl + '/main/' + item.filename);
    }
  }
}
</script>

<style lang="less">
@import '../../static/global.less';

  .main {
    height: 100%;
    .carousel {
      max-width: 960px; // 走马灯宽度
      margin: 0 auto;
      .el-carousel__container {
        height: 540px !important;  // 走马灯高度，960*540比例16:9   
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
</style>