<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card class="goods_list">
      <el-row :gutter="16" class="search-area">
        <el-col :span="8">
          <div>
            <el-input 
              placeholder="请输入内容" 
              v-model="queryInfo.query"
              clearable
              @clear="getGoodsList"
            >
            <el-button 
              slot="append" 
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <div>
            <el-button type="primary" @click="goAddPage">添加商品</el-button>
          </div>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table
        :data="goodsList"
        border
        stripe
      >
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column
          v-for="item of goodsTableColumn"
          :key="item.goods_id"
          v-bind="item"
        >
          <template scope="scope" v-if="item.type == 'date'">
            {{scope.row.add_time | dataFormat}}
          </template>
          <template scope="scope" v-else>
            {{scope.row[item.prop]}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100px">
          <template scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small" circle></el-button>
            <el-button @click="removeById(scope.row.goods_id)" type="danger" icon="el-icon-delete" size="small" circle></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 15, 30, 50]"
        :page-size="queryInfo.pagesize"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

  </div>
</template>

<script>
import {request} from "../../network/request"

export default {
  name: "List",
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表的数据
      goodsList: [],
      total: 0,

      goodsTableColumn: [
        {
          label: "商品名称",
          prop: "goods_name"
        },
        {
          label: "商品价格(元)",
          prop: "goods_price",
          width: '120px'
        },
        {
          label: "商品重量",
          prop: "goods_weight",
          width: '80px'
        },
        {
          label: "创建时间",
          prop: "add_time",
          width: '160px',
          type: "date"
        },
      ]

    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 点击添加商品的按钮 的回调
    goAddPage() {
      this.$router.push("/goods/add")
    },

    // 删除商品数据的回调
    async removeById(id) {
      let res = await this.$confirm("此操作将永久删除该参数, 是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"

        // 捕获用户的取消行为 将它return出去
      }).catch(err => err)

      // 证明用户取消了操作
      if(res !== "confirm") {
        this.$message.info("已取消删除")
        return
      }

      let {data: ret} = await request({
        url: `goods/${id}`,
        method: "delete"
      })

      if(ret.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "删除失败",
          duration: 1000
        })
        return
      }

      this.$message.success("删除商品成功")
      this.getGoodsList()
    },

    // 选择每页显示多少条数据的回调
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },

    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    // 根据分页获取对应的商品的列表
    async getGoodsList() {
      let {data: res} = await request({
        url: "/goods",
        method: "get",
        params: this.queryInfo,
      })

      if(res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "获取商品列表失败",
          duration: 1000
        })
        return
      }

      this.$message({
        type: "success",
        message: "获取商品列表成功",
        duration: 1000
      })

      this.goodsList = res.data.goods
      this.total = res.data.total

      console.log(this.goodsList);
    }
  }
}
</script>

<style lang="less" scoped>
  .goods_list {
    margin-top: 24px;
    font-size: 12px;

    .search-area {
      margin-bottom: 24px;
    }
  }
</style>