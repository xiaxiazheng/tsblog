<template>
  <div class="treemain">
    <h1>树的首页</h1>
    <h2 v-if="type === 'home'">
      前台展示，施工中
    </h2>
    <h2 v-if="type === 'admin'">
      控制台，施工中
    </h2>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {
    TreeMain
  },
})
export default class TreeMain extends Vue {
  @Prop() type: string;
}
</script>

<style lang="less" scoped>
@import '../static/global.less';

  .treemain {
    height: 100%;
  }
</style>