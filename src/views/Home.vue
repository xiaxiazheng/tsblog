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
  .home {
    height: 100%;
    .homerouter {
      height: calc(100% - 3.6rem);
    }
  }
</style>