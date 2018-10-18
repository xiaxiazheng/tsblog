<template>
  <div class="adminmain">
    <UploadPhotoWall type="main"></UploadPhotoWall>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import UploadPhotoWall from '@/components/UploadPhotoWall.vue';

@Component({
  components: {
    UploadPhotoWall
  },
})
export default class AdminMain extends Vue {

}
</script>

<style lang="less">
  .adminmain {
    height: 100%;
  }
</style>
