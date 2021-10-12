<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card class="category">
      <el-row class="btn-wrap">
        <el-col>
          <el-button type="primary" @click="showCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="catagoryList"
        :columns="columnData"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <template slot="isOk" scope="scope">
          <i v-if="!scope.row.cat_delated" class="el-icon-success" style="color: lightgreen"></i>
          <i v-else class="el-icon-error" style="color:red"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" scope="scope">
          <el-tag type="primary" size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-if="scope.row.cat_level === 2">三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" scope="scope">
          <el-button type="primary" icon="el-icon-search" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >

      <el-form 
        :model="addCateForm" 
        :rules="addCateFormRules" 
        ref="addCateFormRef" 
        class="demo-ruleForm"
        label-width="100px"
      >
        <el-form-item label="分类名称: " prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类: ">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          >
          </el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from '../../network/request'
export default {
  name: "GoodsCategory",
  data() {
    return {
      // 选中的父级分类的数组
      selectedKeys: [],

      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },

      // 添加分类按钮后 为了展示下拉菜单里面是所有的父级分类情况 {   }
      parentCateList: [],

      // 添加分类表单的数据对象
      addCateForm: {
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,

        // 分类的等级 默认要添加的是1级分类
        cat_level: 0
      },

      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          {required: true, message: "请输入分类名", trigger: "blur"},
        ]
      },

      // 添加分类 的 对话框
      addCateDialogVisible: false,

      // 商品分类的数据列表 默认为空
      catagoryList: [],

      // 定义页面加载请求商品列表的请求参数对象
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,

      columnData:[
        {
          prop: "cat_name",
          label: "分类名称",
          minWidth: 100,
        },
        {
          label: "是否有效",
          minWidth: 100,

          // 如果它的值为type 代表我想将这列渲染成自定义的模板列
          type:"template",
          // 自定义模板列需要使用哪个作用域插槽呢？ 也就是插槽的名字
          template: "isOk"
        },
        {
          label: "排序",
          type:"template",
          template: "order",
          minWidth: 100,
        },
        {
          label: "排序",
          type:"template",
          template: "opt",
          minWidth: 100,
        }
      ],
    }
  },
  methods: {
    // 监听对话框的关闭事件 重置表单数据
    addCateDialogClosed() {
      // 清空表单中的数据
      this.$refs.addCateFormRef.resetFields()
      // 清空级联选择器 绑定的数组重置为空数组
      this.selectedKeys = []

      // 把它俩也重置为0
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },

    // 级联选择器对话框中的 确定按钮的回调
    addCate() {
      this.$refs.addCateFormRef.validate( async valid => {
        if(!valid) return
        let {data: res} = await request({
          url: "/categories",
          method: "post",
          data: this.addCateForm
        })

        if(res.meta.status !== 201) {
          this.$message({
            type: "error",
            message: "添加分类失败",
            duration: 1000
          })
          return
        }

        this.$message({
          type: "success",
          message: "添加分类成功",
          duration: 1000
        })
        this.getCategoryList()
        this.addCateDialogVisible = false
      })
    },

    // 级联选择器 选项发生变化触发这个函数
    parentCateChanged() {

      // 我们在这里面做判断 只要级联选择器发生了变化 那么 selectedKeys 数组也必然会发生变化
      // selectedKeys是父级分类id的数据 也就是说当我们选择了父级分类 这个数组里面就会有id数据
      // 如果 selectedKeys.length > 0 证明选中了父级分类 反之 则代表它是1级分类
      // 那我们添加的这个分类的父分类的id就应该是最后一项吧
      if(this.selectedKeys.length > 0) {
        // 最会这个数组的最后一项怎么选中呢？ 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]

        // 如果1级分类level就是0 如果是二级分类level就是1 如果是三级分类level就是2 level的值就是length
        this.addCateForm.cat_level = this.selectedKeys.length
        return

      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },

    // 点击按钮展示添加分类的对话框
    showCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },

    // 点击 添加分类按钮后 请求数据 展示所有父级分类
    async getParentCateList() {
      let {data: res} = await request({
        url: "/categories",
        params: {type: 2}
      })

      if(res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "获取父级分类数据失败",
          duration: 1000
        })

        return
      }

      // 我们将获取的数据保存在data身上
      this.parentCateList = res.data
    },

    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // pagesize改变了就要重新请求数据
      this.getCategoryList()
    },

    // 监听pagenum改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCategoryList()
    },

    async getCategoryList() {
      let {data: res} = await request({
        url: "/categories",
        method: "get",
        params: this.queryInfo
      })

      if(res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "获取商品分类失败",
          duration: 1000
        })

        return
      }
      this.total = res.data.total
      this.catagoryList = res.data.result
    }
  },
  created() {
    this.getCategoryList()
  }
}
</script>

<style>
  .category {
    margin-top: 24px;
    font-size: 12px;
  }

  .btn-wrap {
    margin-bottom: 24px;
  }

  .el-pagination {
    margin-top: 24px;
  }

  .el-cascader {
    width: 100%;
  }

  .el-cascader-menu {
    height: 300px;
  }

  .el-cascader__dropdown {
    top: 200px;
  }
</style>