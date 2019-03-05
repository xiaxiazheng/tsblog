<template>
  <div class="chart ScrollBar">
    <FloatChart></FloatChart>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import FloatChart from '@/components/floatchart/FloatChart.vue';

@Component({
  components: {
    FloatChart,
  },
})
export default class Chart extends Vue {
  
}
</script>

<style lang="less" scoped>
  .chart {
    width: 100%;
  }
</style>