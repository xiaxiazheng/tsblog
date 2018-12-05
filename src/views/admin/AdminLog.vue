<template>
  <div class="adminlog">
    <AdminLogCont></AdminLogCont>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import AdminLogCont from '@/components/logcont/AdminLogCont.vue';

@Component({
  components: {
    AdminLogCont
  },
})
export default class AdminLog extends Vue {

}
</script>

<style lang="less">
  .adminlog {
    height: 100%;
  }
</style>
