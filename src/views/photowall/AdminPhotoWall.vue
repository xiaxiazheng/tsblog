<template>
  <div class="adminwall">
    <div class="ScrollBar">
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
  .adminwall {
    overflow-y: auto;
    >div {
      height: calc(100% - 30px);
      padding: 15px;
    }
  }
</style>
