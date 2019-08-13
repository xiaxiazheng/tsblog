<template>
  <div class="adminhomemain">
    <div class="">
      <ImageBox
        v-for="(item, index) of imageList"
        :key="index"
        type="main"
        :imageFileName="item.filename"
        :imageName="item.imgname"
        :imageId="item.img_id"
        :initImageList="initImageList">
      </ImageBox>
      <ImageBox type="main" :imageFileName="''" :initImageList="initImageList"></ImageBox>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import ImageBox from '@/components/ImageBox.vue';
import { ImgHelper } from '@/client/ImgHelper';
import { baseUrl, baseImgUrl } from '../../config';

interface ImageTableType {
  type: string;
  img_id: string;
  filename: string;
  imgname: string;
  other_id: string;
  cTime: string;
}

@Component({
  components: {
    ImageBox
  },
})
export default class AdminHomeMain extends Vue {
  imageList: ImageTableType[] = [];

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  async init() {
    let res = await ImgHelper.getImgList('main');
    if (res) {
      this.imageList = res;
    }
  }

  initImageList() {
    this.init();
  }
}
</script>

<style lang="less">
  
</style>
