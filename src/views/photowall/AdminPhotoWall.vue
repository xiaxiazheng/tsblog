<template>
  <div class="adminwall">
    <div class="ScrollBar">
      <ImageBox
        v-for="(item, index) of imageList"
        :key="index"
        type="wall"
        :imageFileName="item.filename"
        :imageName="item.imgname"
        :imageId="item.img_id"
        :initImageList="initImageList">
      </ImageBox>
      <ImageBox type="wall" :imageFileName="''" :initImageList="initImageList"></ImageBox>
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
export default class AdminPhotoWall extends Vue {
  imageList: ImageTableType[] = [];

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  async init() {
    let res = await ImgHelper.getImgList('wall');
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
  .adminwall {
    overflow-y: auto;
    >div {
      height: calc(100% - 30px);
      padding: 15px;
    }
  }
</style>
