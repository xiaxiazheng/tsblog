<template>
  <div class="chart ScrollBar">
    <FloatChart></FloatChart>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { TreeClient } from '../../util/clientHelper';
import FloatChart from '@/components/floatchart/FloatChart.vue';
import FloatChartByGoJS from '@/components/floatchart/FloatChartByGoJS.vue';

@Component({
  components: {
    FloatChart,
    FloatChartByGoJS
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