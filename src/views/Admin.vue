<template>
  <div class="admin">
    <Nav type="admin"></Nav>
    <router-view class="adminrouter"></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { apiUrl } from '../api/url'
import Nav from '@/components/Nav.vue'

@Component({
  components: {
    Nav
  },
})
export default class Admin extends Vue {
  beforeCreate() {
		if(sessionStorage.getItem("xia_username") && sessionStorage.getItem("xia_password")) {
      var self = this,
        params = {
          username: sessionStorage.getItem("xia_username"),
          userpword: window.atob(sessionStorage.getItem("xia_password"))
        };
      apiUrl.postLogin(params).then(function(res) {
        if(res.data.resultsCode === "success") {
          return;
        } else {
          self['$message']({
            type: 'error',
            message: "请重新登陆"
          });
          self['$router'].push('/login');
        }
      }).catch(function(res) {
        self['$message']({
          type: 'error',
          message: res.message
        });
      });
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