<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card class="order">
      <el-row>
        <el-col :span="8">
          <div>
            <el-input placeholder="请输入内容">
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>
        </el-col>
      </el-row>

      <el-table
        :data="orderList"
        border
        stripe
        class="order-table"
      >
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column
          v-for="(item, index) of tableColumns" 
          :key="index" 
          v-bind="item"
        >
          <template scope="scope" v-if="item.type == 'date'">
            {{scope.row[item.prop] | dataFormat}}
          </template>

          <template v-else-if="item.type == 'pay'" scope="scope">
            <el-tag type="danger" v-if="scope.row[item.prop] == '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>

          <template v-else scope="scope">
            {{scope.row[item.prop]}}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150">
          <template scope="scope">
            <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" circle size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>

      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 30, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form :model="addresForm" :rules="addresFormRules" ref="addresFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="addresForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addresForm.address2"></el-input>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
      @close="progressDialogClosed"
    >
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in progressData"
          :key="index"
          :timestamp="item.time">
          {{item.context}}
        </el-timeline-item>
      </el-timeline>

      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {request} from "../../network/request"
import cityData from "./citydata"

export default {
  name: "Order",
  data() {
    return {
      // 物流数据
      progressData: [],
      progressVisible: false,
      addresForm: {
        address1: [],
        address2: ""
      },
      addresFormRules: {
        address1: [
          {required: true, message: "请选择省市区", trigger: "blur"}
        ],
        address2: [
          {required: true, message: "请选择详细地址", trigger: "blur"}
        ]
      },
      cityData,
      addressVisible: false,
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },

      orderList: [],
      total: 0,

      tableColumns: [
        {
          prop: "order_number",
          label: "订单编号",
        },
        {
          prop: "order_price",
          label: "订单价格",
          minWidth: 50,
        },
        {
          prop: "pay_status",
          label: "是否付款 ",
          minWidth: 50,
          type: "pay"
        },
        {
          prop: "is_send",
          label: "是否发货",
          minWidth: 50,
        },
        {
          prop: "create_time",
          label: "下单时间",
          type: "date"
        },
      ]
    }
  },

  created() {
    this.getOrderList()
  },

  methods: {
    // 点击位置按钮 展示物流信息
    async showProgressBox() {

      // let {data: res} = await request({
      //   url: "/kuaidi/1106975712662",
      //   method: "get"
      // })

      // if(res.meta.status !== 200) {
      //   this.$message.error("请求获取物流数据失败")
      //   return
      // }

      // this.progressData = res.data
      this.progressVisible = true
      // console.log(this.progressData)
    },

    // 关闭物流信息对话框的回调
    progressDialogClosed() {},

    addressDialogClosed() {
      this.$refs.addresFormRef.resetFields()
    },
    showBox() {
      this.addressVisible = true
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },

    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },

    async getOrderList() {
      let {data: res} = await request({
        url: "/orders",
        method: "get",
        params: this.queryInfo
      })
      if(res.meta.status !== 200) {
        this.$message.error("请求订单数据失败")
        return
      }

      this.orderList = res.data.goods
      this.total = res.data.total
    }
  }
}
</script>

<style lang="less" scoped>
  .order {
    margin-top: 24px;

    .order-table {
      margin-top: 24px;
    }

    .el-cascader {
      width: 100%;
    }
  }
</style>