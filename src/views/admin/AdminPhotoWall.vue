<template>
  <div class="adminwait">
    <UploadPhotoWall type="wall"></UploadPhotoWall>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import UploadPhotoWall from '@/components/UploadPhotoWall.vue'

@Component({
  components: {
    UploadPhotoWall
  },
})
export default class AdminPhotoWall extends Vue {

}
</script>

<style lang="less">
@import '../../static/global.less';

  .adminwait {
    height: 100%;
  }
</style>
