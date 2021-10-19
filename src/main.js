import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from "./router"
import TreeTable from "vue-table-with-tree-grid"
import "./assets/css/common.less"
import "./assets/css/hover.css"
import "./plugin/elementui"
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 将富文本编辑器注册成全局可用的组件
Vue.use(VueQuillEditor)

Vue.component("tree-table", TreeTable)
Vue.config.productionTip = false

Vue.filter("dataFormat", function(originValue) {
  const date = new Date(originValue)
  let y = date.getFullYear()
  let m = (date.getMonth() + 1 + "").padStart(2, '0')
  let d = (date.getDate() + "").padStart(2, '0')

  let hh = (date.getHours() + "").padStart(2, '0')
  let mm = (date.getMinutes() + "").padStart(2, '0')
  let ss = (date.getSeconds() + "").padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
