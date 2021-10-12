import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from "./router"
import TreeTable from "vue-table-with-tree-grid"
import "./assets/css/common.less"
import "./assets/css/hover.css"
import "./plugin/elementui"

Vue.component("tree-table", TreeTable)
Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
