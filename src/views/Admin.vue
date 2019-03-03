<template>
  <div class="admin">
    <MyNav type="admin"></MyNav>
    <router-view class="adminrouter"></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { UserClient } from '../util/clientHelper';
import MyNav from '@/components/MyNav.vue';

@Component({
  components: {
    MyNav
  },
})
export default class Admin extends Vue {
  async beforeCreate() {
    if (sessionStorage.getItem("xia_username") && sessionStorage.getItem("xia_password")) {
      let username: any = sessionStorage.getItem("xia_username");
      let userpword: any = window.atob(<string>sessionStorage.getItem("xia_password"));
      let res: any = await UserClient.postLogin(username, userpword);
      if (!res) {
        this.$router.push('/login');
      }
      if (res.resultsCode !== "success") {
        this.$message.error("请重新登陆");
        this.$router.push('/login');
      }
    } else {
      this.$message.warning("请先登陆");
      this.$router.push('/login');
    }
  }
}
</script>

<style lang="less" scoped>
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .admin {
    height: 100%;
    overflow: hidden;
		.adminrouter {
      height: calc(100% - 3.6rem - 1px);
      padding-top: 58px;
		}
  }  
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .admin {
		height: 100%;
		.adminrouter {
      height: calc(100% - 38px);
		}
  }  
}
</style>