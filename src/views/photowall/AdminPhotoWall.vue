<template>
  <div class="adminwait">
    <div>
      <UploadPhotoWall type="wall"></UploadPhotoWall>      
    </div>
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
export default class AdminPhotoWall extends Vue {

}
</script>

<style lang="less">
  .adminwait {
    overflow-y: auto;
    >div {
      padding: 15px;
    }
  }
</style>
