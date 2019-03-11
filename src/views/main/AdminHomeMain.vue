<template>
  <div class="adminhomemain">
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
export default class AdminHomeMain extends Vue {

}
</script>

<style lang="less">
  
</style>
