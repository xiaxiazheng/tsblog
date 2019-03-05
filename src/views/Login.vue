<template>
  <div class="login">
		<div class="loginCont">
      <div class="loginBox">
        <span>Please Login:</span>
        <el-input class="elinput1" v-model="username" placeholder="请输入用户名" maxlength="10"></el-input>
        <el-input type="password" v-model="userpword" v-if="!showPassword" placeholder="请输入密码" maxlength="16" @keyup.native.enter="login">
          <i slot="suffix" title="显示密码" @click="changePass('hide')" class="el-icon-view eye"></i>
        </el-input>
        <el-input type="text" v-model="userpword" v-if="showPassword" placeholder="请输入密码" maxlength="16" @keyup.native.enter="login">
          <i slot="suffix" title="隐藏密码" @click="changePass('hide')" style="color:#409eff;" class="el-icon-view eye"></i>
        </el-input>
        <el-button type="primary" @click="login">登录</el-button>
      </div>
		</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { UserHelper } from '../client/UserHelper';

@Component
export default class Login extends Vue {
  username: string = '';
  userpword: string = '';
  showPassword: boolean = false;

  async created() {
    if (sessionStorage.getItem("xia_username") && sessionStorage.getItem("xia_password")) {
      let name = sessionStorage.getItem("xia_username");
      let pword = window.atob(<string>sessionStorage.getItem("xia_password"));
      let params = {
        username: name,
        userpword: pword
      };
      let res = await UserHelper.postLogin(params);
      if (res) {
        this.$router.replace({ path: 'admin' });
      } else {
        this.$message.error("请重新登陆");
      }
    }
  }

  async login() {
    if (!this.checkEmpty()) {
      return;
    }
    let params = {
      username: this.username,
      userpword: this.userpword
    };
    let res = await UserHelper.postLogin(params);
    if (res) {
      this.$router.replace({ path: 'admin' });
      sessionStorage.setItem("xia_username", this.username);
      sessionStorage.setItem("xia_password", window.btoa(this.userpword));
    } else {
      this.$message.error("密码错误或用户不存在，请重新输入");
      this.userpword = '';
    }
  }

  // 查是否为空
  checkEmpty() {
    if (this.username !== '' && this.userpword !== '') {
      return true;
    }
    let warning = this.username === '' ? '账号' : '密码';
    this.$message.warning(`${warning}不可为空`);
    return false;
  }

  changePass() {
    this.showPassword = !this.showPassword;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .login {
    height: 100%;
    .loginCont {
      height: 100%;
      background: url('~@/assets/login.jpg') no-repeat fixed;
      background-size: 100% 100%;
      .loginBox {
        width: 250px;
        height: 300px;
        position: absolute;
        right: 16rem;
        top: 16rem;
        border-radius: 10px;
        padding: 30px 15px 0px;
        background-color:rgba(181, 182, 181, 0.5);
        z-index: 3;
        > span {
          position: absolute;
          font-size: 20px;
          font-weight: rgba(38, 39, 38, 0.5);
        }
        .el-input {
          margin-top: 30px;
          // .el-input__inner {
          //   BACKGROUND-COLOR: transparent;
          // }
          .eye {
            cursor: pointer;
            margin-right: 5px;
            line-height: 40px;
            font-size: 20px;
          }
        }
        .elinput1 {
          margin-top: 60px;
        }
        .el-button {
          width: 100%;
          margin-top: 50px;
        }
      }
    }
    .loginCont:after{
      content: "";
      width:100%;
      height:100%;
      position: absolute;
      left:0;
      top:0;
      background: inherit;
      filter: blur(10px);
      z-index: 2;
    }
  }
}

// 移动端
@media screen and (max-width: @splitWidth) {
  .login {
    height: 100%;
    .loginCont {
      height: 100%;
      background: url('~@/assets/login.jpg') no-repeat fixed;
      background-size: 100% 100%;
      .loginBox {
        width: 300px;
        height: 300px;
        position: absolute;
        left: 50%;
        top: 50%;
        margin-left: -165px;
        margin-top: -165px;
        border-radius: 10px;
        padding: 30px 15px 0px;
        background-color:rgba(181, 182, 181, 0.5);
        z-index: 3;
        > span {
          position: absolute;
          font-size: 20px;
          font-weight: rgba(38, 39, 38, 0.5);
        }
        .el-input {
          margin-top: 30px;
          // .el-input__inner {
          //   BACKGROUND-COLOR: transparent;
          // }
          .eye {
            cursor: pointer;
            margin-right: 5px;
            line-height: 40px;
            font-size: 20px;
          }
        }
        .elinput1 {
          margin-top: 60px;
        }
        .el-button {
          width: 100%;
          margin-top: 50px;
        }
      }
    }
    .loginCont:after{
      content: "";
      width:100%;
      height:100%;
      position: absolute;
      left:0;
      top:0;
      background: inherit;
      filter: blur(10px);
      z-index: 2;
    }
  }
}
</style>
