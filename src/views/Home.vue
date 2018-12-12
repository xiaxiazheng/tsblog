<template>
  <div class="home">
    <MyNav type="home"></MyNav>
    <router-view class="homerouter"></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MyNav from '@/components/MyNav.vue'; // @ is an alias to /src

@Component({
  components: {
    MyNav
  },
})
export default class Home extends Vue {

}
</script>

<style lang="less" scoped>
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .home {
    height: 100%;
    .homerouter {
      height: calc(100% - 3.6rem);
      padding-top: 58px;
    }
  }
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .home {
    height: 100%;
    .homerouter {
      height: calc(100% - 38px);
    }
  }
}
</style>