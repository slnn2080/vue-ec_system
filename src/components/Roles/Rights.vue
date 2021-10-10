<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="rightsList">
      <el-table
        :data="rightsList"
        border
        stripe
      >
        <el-table-column 
          type="index" 
          label="#" 
          align="center"
        ></el-table-column>
        <el-table-column 
          v-for="(item, index) of columnData" 
          :key="item.id" 
          v-bind="item"
        >
          <template v-if="item.type == 'tag'" scope="scope">
            <el-tag v-if="scope.row.level == '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level == '1'" type="success">二级</el-tag>
            <el-tag v-else="scope.row.level == '2'" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {request} from "../../network/request"
export default {
  name: "Rights",
  data() {
    return {
      // 权限列表
      rightsList: [],

      // 权限列表 列的数据
      columnData:[
        {
          prop: "authName",
          label: "权限名称",
          minWidth: 100,
        },
        {
          prop: "path",
          label: "路径",
          minWidth: 100,
        },
        {
          prop: "level",
          label: "权限等级",
          minWidth: 100,
          type:"tag"
        },
      ],
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      let {data: res} = await request({
        url: "rights/list",
        method: "get"
      })

      if(res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "查询权限列表失败",
          duration: 1000
        })
        return
      }

      // 将获取的数据放到 data配置项的 rightsList 里面供模板进行使用
      this.rightsList = res.data
    }
  }
}
</script>

<style scoped>
  .rightsList {
    margin-top: 24px;
    font-size: 12px;
  }
</style>