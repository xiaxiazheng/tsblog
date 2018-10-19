<template>
  <div class="treemain">
    <div v-if="baseEnv === 'productionPig'">
      <h1>盛兴中英文学校</h1>
      <h2>孩子要成才，请到盛兴来！</h2>
    </div>
    <div v-else>
      <h1>树的首页</h1>
      <h2 v-if="type === 'home'">
        前台展示，施工中
      </h2>
      <h2 v-if="type === 'admin'">
        控制台，施工中
      </h2>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { baseEnv } from '../config';

@Component
export default class TreeMain extends Vue {
  @Prop() type: any;

  baseEnv: string = baseEnv;

  // mounted() {
  //   this.$nextTick(function () {
      
  //   });
  // }
}
</script>

<style lang="less" scoped>
  .treemain {
    height: 100%;
  }
</style>