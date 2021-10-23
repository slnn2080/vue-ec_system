import axios from 'axios'

// 导入包对应的js 和 css
import NProgress from "nprogress"
import "nprogress/nprogress.css"

export function request(config) {
  const instance = axios.create({
    baseURL: "http://127.0.0.1:8888/api/private/v1"
  })

  instance.interceptors.request.use(config => {

    NProgress.start()

    // 为请求头对象 添加 token 验证的 authorization 字段
    config.headers.Authorization = window.sessionStorage.getItem("token")
    return config
  }, err => {
    console.log(err)
  })


  instance.interceptors.response.use((config) => {
    NProgress.done()
    return config
  })

  return instance(config)
}