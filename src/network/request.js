import axios from 'axios'

export function request(config) {
  const instance = axios.create({
    baseURL: "http://127.0.0.1:8888/api/private/v1"
  })

  instance.interceptors.request.use(config => {
    // 为请求头对象 添加 token 验证的 authorization 字段
    config.headers.Authorization = window.sessionStorage.getItem("token")
    return config
  }, err => {
    console.log(err)
  })

  return instance(config)
}