<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header class="logout-header">
      <div>
        <i class="el-icon-s-shop logo-icon"></i>
        <span>轻 "商" 管理</span>
      </div>
      <div>
        <el-button class="logout-btn" size="small" v-on=""@click="logout">Logout</el-button>
      </div>
    </el-header>

    <!-- 页面主体区域 -->
    <el-container class="main-area">

      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px' ">
        <div class="menu-toggle">
          <i class="el-icon-lollipop hvr-bounce-in" @click="toggleMenu"></i>
        </div>
        <el-menu
          background-color="#BFB400"
          text-color="#212121"
          active-text-color="#FFFABF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 1级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item of menuList" :key="item.id">
            <!-- 1级菜单的模板区 -->
            <template slot="title">
              <i :class="icons[item.id]" class="menu-icon-color"></i>
              <span>{{item.authName}}</span>
            </template>

            <!-- 2级菜单 -->
            <el-menu-item 
              :index="`/${i.path}`" 
              v-for="i of item.children" 
              :key="i.id"
              @click="saveNavState(`/${i.path}`)"
            >
              <template slot="title">
                <i class="el-icon-menu menu-icon-color"></i>
                <span>{{i.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右边主体 -->
      <el-main>
        <div class="content">
          <router-view></router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {request} from "../network/request"
export default {
  name: "Home",
  data() {
    return {
      activePath: "",
      menuList: [],
      icons: {
        // 因为每一个1级菜单都有自己的key 这个key是通过id来定义的 所以我们以id的值作为key 值为字体图标
        "125": "el-icon-user-solid",
        "103": "el-icon-star-on",
        "101": "el-icon-goods",
        "102": "el-icon-s-help",
        "145": "el-icon-s-platform"
      },
      isCollapse: false,
    }
  },
  methods: {
    // 保存链接的激活状态
    saveNavState(value) {
      window.sessionStorage.setItem("activePath", value)
      this.activePath = value
    },

    logout() {
      window.sessionStorage.clear()
      this.$router.push("/login")
    },

    // 控制 菜单栏的展开和合并
    toggleMenu()  {
      this.isCollapse = !this.isCollapse
    },

    // 获取所有菜单
    async getMenuList() {
      let {data: res} = await request({
        url: "/menus",
        method: "get"
      })
      if(res.meta.status !== 200) return this.$message.error(res.meta.$message)
      this.menuList = res.data
    }
  },

  created() {
    this.getMenuList(),
    this.activePath = window.sessionStorage.getItem("activePath")
  }
}
</script>

<style lang="less" scoped>

.logout-header {
  background: rgb(64,60,0);
  background: linear-gradient(171deg, rgba(64,60,0,1) 0%, rgba(0,0,0,1) 23%, rgba(255,251,191,1) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;

  .logout-btn {
    background-color:#FFF440 ;
    color:#212121;
  }

  >div:first-child {
    display: flex;
    align-items: center;
    .logo-icon {
      margin-right: 10px;
      font-size: 40px;
      position: relative;

      + span {
        margin-left: 10px;
        font-size:20px;
      }
    }
  }
}

.main-area {
  margin-top: 5px;
}

.el-aside {
  background: rgb(136,128,8);
  background: linear-gradient(156deg, rgba(136,128,8,1) 0%, rgba(255,255,255,1) 46%, rgba(191,180,0,1) 100%);
  .menu-icon-color {
    color: #212121;
    margin-right: 10px;
    font-size:16px;
  }

  .el-menu {
    border-right: none;
  }

  .menu-toggle {
    height: 30px;
    text-align: center;
    line-height: 30px;
    color:#ffffff;
    font-weight: 600;
    background-color: #403C00;
    font-size: 18px;
  }
}
.el-main {
  background: rgb(255,253,230);
  background: linear-gradient(325deg, rgba(255,253,230,1) 0%, rgba(255,255,255,1) 100%);
  margin-left: 5px;
  padding:30px;
}

.home-container {
  height: 100%;
}

.hvr-bounce-in {
  display: inline-block;
  vertical-align: middle;
  -webkit-transform: perspective(1px) translateZ(0);
  transform: perspective(1px) translateZ(0);
  box-shadow: 0 0 1px rgba(0, 0, 0, 0);
  -webkit-transition-duration: 0.5s;
  transition-duration: 0.5s;
}
.hvr-bounce-in:hover, .hvr-bounce-in:focus, .hvr-bounce-in:active {
  -webkit-transform: scale(1.2);
  transform: scale(1.2);
  -webkit-transition-timing-function: cubic-bezier(0.47, 2.02, 0.31, -0.36);
  transition-timing-function: cubic-bezier(0.47, 2.02, 0.31, -0.36);
}
</style>