<template>
  <div class="home">
    <Nav type="home"></Nav>
    <router-view class="homerouter"></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Nav from '@/components/Nav.vue'; // @ is an alias to /src

@Component({
  components: {
    Nav
  },
})
export default class Home extends Vue {

}
</script>

<style lang="less" scoped>
@import '../static/global.less';

  .home {
    height: 100%;
    .homerouter {
      height: calc(100% - 3.6rem);
    }
  }
</style>