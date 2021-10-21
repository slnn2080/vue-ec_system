<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="report">
      <div id="main"></div>
    </el-card>
  </div>
</template>

<script>
// import echarts from "echarts"
import * as echarts from "echarts"
import {request} from "../../network/request"
import _ from "lodash"

export default {
  name: "Reprot",
  data() {
    return {
      // 需要将这个数据 和 服务器请求回来的数据进行合并
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  methods: {
    async chartInit() {
      let myChart = echarts.init(document.getElementById("main"))

      let {data: res} = await request({
        url: "reports/type/1",
        method: "get"
      })

      if(res.meta.status !== 200) {
        this.$message.error("获取图表数据失败")
      }

      let ret = _.merge(res.data, this.options)
      myChart.setOption(ret);
    },
  },
  mounted() {
    this.chartInit()
  },
  created() {

  },
}
</script>

<style lang="less" scoped>
  .report {
    margin-top: 24px;

    #main {
      width: 600px;
      height: 400px;
    }
  }
</style>