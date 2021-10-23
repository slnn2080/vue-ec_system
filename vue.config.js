module.exports = {
  /*
  chainWebpack: config => {

    // 发布模式
    config.when(process.env.NODE_ENV === "production", config => {
      config.entry("app").clear().add('./src/main-prod.js')

      // 我们添加到这里
      config.set("externals", {
        vue: "Vue",
        "vue-router": "VueRouter",
        axios: "axios",
        lodash: "_",
        echarts: "echarts",
        nprogress: "NProgress",
        "vue-quill-editor": "VueQuillEditor"
      })
    })


    // 开发模式
    config.when(process.env.NODE_ENV === "development", config => {
      config.entry("app").clear().add('./src/main-dev.js')
    })
  },
  */
  lintOnSave: false
}