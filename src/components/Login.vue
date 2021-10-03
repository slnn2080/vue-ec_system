<template>
  <div class="login-container">
    <div class="login-wrap">
      <!-- 登录头像区 -->
      <div class="avatar-wrap">
        <img src="../assets/logo.png" alt="">
      </div>

      <!-- 登录表单区域 -->
      <el-form 
        class="login-form" 
        size="small"
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
      >
        <el-form-item prop="username">
          <el-input 
            prefix-icon="el-icon-user-solid"
            v-model="loginForm.username"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            prefix-icon="el-icon-message"
            v-model="loginForm.password"
            type="password"
          >
          </el-input>
        </el-form-item>
        <el-form-item class="btn-wrap">
          <el-button type="primary" @click="loginSubmit">登录</el-button>
          <el-button type="info" @click="resetLogin">重置</el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>

<script>
import {request} from '../network/request'

export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginRules: {
        username: [
          {required: true, message: "请输入用户名", trigger: "blur"},
          {min:4, max:10, message: "长度在 4 到 10 个字符", trigger: "blur"}
        ],
        password: [
          {required: true, message: "请输入密码", trigger: "blur"},
          {min:4, max:10, message: "长度在 4 到 10 个字符", trigger: "blur"}
        ]
      }
    }
  },
  methods: {
    resetLogin() {
      this.$refs.loginFormRef.resetFields()
    },
    loginSubmit() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if(!valid) return
        try {
          let {data: res} = await request({
            url: "/login",
            method: "post",
            data: this.loginForm
          })
          if(res.meta.status !== 200) return this.$message({
            message: res.meta.msg,
            type: "error",
            duration: "1000"
          })
          this.$message.success("登录成功")

          // 我们将从服务器获取的token保存在 sessionStorage 中
          window.sessionStorage.setItem("token", res.data.token)

          // 既然成功登录 就让它跳转到首页
          this.$router.push("/home")

        } catch(err) {
          console.log(err)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login-container {
    background-color: #2b4b6b;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .login-wrap {
      width: 450px;
      height: 300px;
      background-color: #fff;
      border-radius: 5px;
      position: relative;
      box-shadow: 2px 2px 10px rgba(0, 0, 0, .3);

      .avatar-wrap {
        width: 130px;
        height: 130px;
        border-radius: 50%;
        background-color: #fff;
        padding:10px;
        position: absolute;
        left: 50%;
        top: -53px;
        transform: translateX(-50%);
        box-shadow: 0 2px 10px rgba(0,0,0,.3), 0px 0px 5px rgba(0, 0, 0, .3) inset;

        img {
          width: 105%;
          height: 105%;
          position: absolute;
          top: 42%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }

      .login-form {
        position:absolute;
        bottom: 15px;
        width: 100%;
        padding: 0 30px;
        box-sizing: border-box;


        .btn-wrap {
          text-align: center;
        }
      }
    }
  }
</style>