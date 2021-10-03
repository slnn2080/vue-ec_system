import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Welcome from '../components/Welcome.vue'
import Home from "../views/Home.vue"
import Users from "../components/Users/Users.vue"
import Roles from "../components/Roles/Roles.vue"

Vue.use(Router)

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    component: Login
  },
  {
    path: "/home",
    component: Home,
    redirect: "/welcome",
    children: [
      {
        path:"/welcome",
        component: Welcome
      },
      {
        path:"/users",
        component: Users
      },
      {
        path:"/roles",
        component: Roles
      }
    ]
  },
]
const router = new Router({
  routes,
  mode: "history"
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {

  // to将要访问的路径 from代表从哪个路径跳转而来 next是一个函数表示放行 要return么？要return 这样放行后 后面的逻辑就不执行了 return next() 这个写法真有意思 nnd
  if(to.path === "/login") return next()
  

  // 如果没有return出去 那么就说明要访问的是有权限的页面就需要进行判断
  const tokenStr = window.sessionStorage.getItem("token")
  if(!tokenStr) return next("/login")

  // 如果没有return出去就是没有return到login 就说明token是存在的 直接放行
  next()

})


export default router