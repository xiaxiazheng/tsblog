<template>
  <div class="admin">
    <Nav type="admin"></Nav>
    <router-view class="adminrouter"></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { userClient } from '../util/clientHelper'
import Nav from '@/components/Nav.vue'

@Component({
  components: {
    Nav
  },
})
export default class Admin extends Vue {
  async beforeCreate() {
		if(sessionStorage.getItem("xia_username") && sessionStorage.getItem("xia_password")) {
      let username = sessionStorage.getItem("xia_username"),
          userpword = window.atob(sessionStorage.getItem("xia_password"));
      let res: any = await userClient.postLogin(username, userpword);
      if(!res) return;
      if(res.resultsCode === "success") {
        return;
      } else {
        this['$message']({
          type: 'error',
          message: "请重新登陆"
        });
        this['$router'].push('/login');
      }
    } else {
      this['$message']({
        type: 'warning',
        message: "请先登陆"
      });
      this['$router'].push('/login');
    }
	}
}
</script>

<style lang="less" scoped>
@import '../static/global.less';

  .admin {
		height: 100%;
		.adminrouter {
			height: calc(100% - 3.6rem);
		}
  }
</style>