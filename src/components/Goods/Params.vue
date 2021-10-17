<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="params">
      <el-alert
        title="只能修改三级分类"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区 -->
      <el-row class="cat_opt">
        <el-col :span="6">
          <span class="cat_opt_title">选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            size="small"
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            clearable
          >
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tabs页签区 -->
      <el-tabs class="tab-area" v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>

          <!-- 动态参数表格 -->
          <el-table
            :data="manyTableData"
            border
            stripe
            class="tab-table"
          >
            <el-table-column type="expand">
              <template scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag 
                  v-for="(item, index) of scope.row.attr_vals" 
                  :key="index"
                  class="tag-content"
                  closable
                  @close="handClosed(scope.row, index)"
                >
                  {{item}}
                </el-tag>

                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>

                <!-- 添加新tag按钮 -->
                <el-button 
                  v-else
                  class="button-new-tag" 
                  size="small" 
                  @click="showInput(scope.row)"
                >
                    + New Tag
                  </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" align="center"></el-table-column>
            <el-table-column 
              v-for="(item, index) of manyTableColumn" :key="index" v-bind="item"
            >
            </el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button type="primary" size="mini" @click="showEidtDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled"@click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table
            :data="onlyTableData"
            border
            stripe
            class="tab-table"
          >
            <el-table-column type="expand">
              <template scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag 
                  v-for="(item, index) of scope.row.attr_vals" 
                  :key="index"
                  class="tag-content"
                  closable
                  @close="handClosed(scope.row, index)"
                >
                  {{item}}
                </el-tag>

                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>

                <!-- 添加新tag按钮 -->
                <el-button 
                  v-else
                  class="button-new-tag" 
                  size="small" 
                  @click="showInput(scope.row)"
                >
                    + New Tag
                  </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" align="center"></el-table-column>
            <el-table-column 
              v-for="(item, index) of onlyTableColumn" :key="index" v-bind="item"
            >
            </el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button type="primary" size="mini" @click="showEidtDialog(scope.row.attr_id )">编辑</el-button>
                <el-button type="danger" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane> 
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDiglogClosed"
    >
      <!-- 添加参数的对话框中的表单 -->
      <el-form 
        :model="addForm" 
        :rules="addFormRules" 
        ref="addFormRef" 
        label-width="100px" 
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDiglogClosed"
    >
      <!-- 添加参数的对话框中的表单 -->
      <el-form 
        :model="editForm" 
        :rules="editFormRules" 
        ref="editFormRef" 
        label-width="100px" 
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {request} from "../../network/request"
export default {
  name: "Params",
  data() {
    return {
      // 控制 展开行内 添加 tag 的input框 和 button 的显示 默认的时候隐藏文本框
      // inputVisible: false,  // 会导致页面所有的input同时显示和隐藏 不用了 我们在处理了tableData

      // 展开行内 添加tag功能的 input框 v-model 的变量
      // inputValue: "",
       
      // 控制修改对话框的显示隐藏
      editDialogVisible: false,
      editForm: {

      },
      editFormRules: {
        attr_name: [
          {required: true, message: "请输入参数名称", trigger: "blur"}
        ]
      },

      // addForm 添加动态属性form表单绑定的数据对象
      addForm: {
        attr_name: ""
      },

      // addForm的输入项的验证规则
      addFormRules: {
        attr_name: [
          {required: true, message: "请输入参数名称", trigger: "blur"}
        ]
      },

      // 控制添加动态属性 或 静态参数的 对话框的布尔值
      addDialogVisible: false,
      manyTableColumn: [
        {
          prop: "attr_name",
          label: "参数名称"
        }
      ],

      onlyTableColumn: [
        {
          prop: "attr_name",
          label: "属性名称"
        }
      ],

      // tabs内容区的表格数据
      manyTableData:[],
      onlyTableData: [],

      // tabs v-model 绑定的值
      activeName: "many",
      cateList: [],
      // 级联选择框双向绑定的数组
      selectedKeys: [],

      // 级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        checkStrictly: false,
        value: "cat_id",
        label: "cat_name",
        children: "children"
      }
    }
  },
  computed: {

    // 我们可以根据 当前激活的面板 来决定 对话框的标题是什么
    titleText() {
      return this.activeName == "many" ? "动态参数" : "静态属性"
    },

    // 如果按钮需要被禁用就返回true
    isBtnDisabled() {
      return this.selectedKeys.length !== 3 ? true : false
    },
    cateId() {
       if(this.selectedKeys.length == 3) {
         return this.selectedKeys[2]
       }
       return null
    },
  },
  methods: {
    // 将对 attr_vals 的操作保存到数据库
    async saveAttrVals(row) {
      // 上面我们只是完成了页面效果 接下来我们还要将这个操作保存到数据库中
      let {data: res} = await request({
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        method: "put",
        data: {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      })

      if(res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "修改参数失败",
          duration: 1000
        })
        return
      }

      this.$message({
        type: "success",
        message: "修改参数成功",
        duration: 1000
      })
    },

    // 展开行中 点击 tag 标签的删除按钮 删除该数据
    handClosed(row, index) {
      row.attr_vals.splice(index, 1)
      
      // 上面只是完成了前端页面上的删除效果 我们还要同步到后台程序
      this.saveAttrVals(row)
    },

    // 展开行内 当 文本框失去焦点 或 按下回车后的回调
    handleInputConfirm(row) {
      // 当文本框输入不合法的时候 我们将文本框的内容重置为0 去除空格后看看length
      if(row.inputValue.trim().length === 0) {
        row.inputValue = ""
        // 同时隐藏文本框 最后return出去 因为length为0 那不需要做后续的处理了
        row.inputVisible = false
        return
      }

      // 如果没有return 则说明输入了内容 接下来我们就可以拿到用户输入的值 然后然后push到 attr_vals 这个数组中 因为tag标签就是通过这个数组创建出来的
      row.attr_vals.push(row.inputValue.trim())

      // push完后将 row.inputValue 重置为空
      // row.inputValue = ""

      // 隐藏这个文本输入框
      row.inputVisible = false

      // 上面我们只是完成了页面效果 接下来我们还要将这个操作保存到数据库中
      // let {data: res} = await request({
      //   url: `categories/${this.cateId}/attributes/${row.attr_id}`,
      //   method: "put",
      //   data: {
      //     attr_name: row.attr_name,
      //     attr_sel: row.attr_sel,
      //     attr_vals: row.attr_vals.join(",")
      //   }
      // })

      // if(res.meta.status !== 200) {
      //   this.$message({
      //     type: "error",
      //     message: "添加参数失败",
      //     duration: 1000
      //   })
      //   return
      // }

      // this.$message({
      //   type: "success",
      //   message: "添加参数成功",
      //   duration: 1000
      // })

      // 上面注释掉的部分 已经抽离成这个函数了
      this.saveAttrVals(row)
    },

    // 展开行内 当点击 添加tag 按钮会的回调
    showInput(row) {
      // 当点击 添加tag 按钮后展示 input 框
      row.inputVisible = true

      // 让文本框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    // 点击删除按钮 根据id 删除数据
    async removeParams(attrId) {
      let res = await this.$confirm("此操作将永久删除该参数, 是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)

      // 证明用户取消了操作
      if(res !== "confirm") {
        this.$message.info("已取消删除")
        return
      }

      let {data: ret} = await request({
        url: `categories/${this.cateId}/attributes/${attrId}`,
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

      this.$message.success("删除用户成功")
      this.getTabData()
    },

    // 编辑按钮对话框中 点击确定后的回调
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        let {data: res} = await request({
          // this.editForm.attr_id 因为我们在打开对话框的时候 为了展示已有数据发起过请求 将数据保存在了editForm中 所有这里有id
          url: `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          method: "put",
          data: {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        })

        if(res.meta.status !== 200) {
          this.$message({
            type: "error",
            message: "修改失败",
            duration: 1000
          })
          return
        }

        this.$message({
          type: "success",
          message: "修改成功",
          duration: 1000
        })

        this.getTabData()
        this.editDialogVisible = false
      })
    },

    // 编辑按钮 对话框的关闭事件
    editDiglogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击编辑按钮 展示修改逻辑的对话框
    async showEidtDialog(attrId) {  
      let {data: res} = await request({
        url: `categories/${this.cateId}/attributes/${attrId}`,
        method: "get",
        params: {
          attr_sel: this.activeName
        }
      })
      if(res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: " 查询参数失败",
          duration: 1000
        })
        return
      }

      // 如果没有失败 那我们就将数据保存在 editForm 当中 虽然对话框中只展示里我们请求回来的数据中的一条 但是我们还是把请求回来的数据保存到了editForm中
      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 点击添加参数的对话框的确定按钮 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {

        // !valid 是验证失败
        if(!valid) return

        let {data: res} = await request({
          url: `categories/${this.cateId}/attributes`,
          method: "post",
          data: {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        })

        if(res.meta.status !== 201) {
          this.$message({
            type: "error",
            message: "获取参数失败",
            duration: 1000
          })
          return
        }

        this.$message({
          type: "success",
          message: "获取参数成功",
          duration: 1000
        })
        this.addDialogVisible = false
        this.getTabData()
      })
    },

    // 监听 添加动态参数 静态属性对话框的关闭事件
    addDiglogClosed() {
      // 当关闭对话框后应该清除 验证的效果 
      this.$refs.addFormRef.resetFields()
    }, 

    // tab的点击事件的处理函数
    handleTabClick() {
      this.getTabData()
    },

    // 级联选择框 选中后的处理函数
    handleChange() {
      this.getTabData()
    },

    // 封装请求tabs内容区数据的函数 该函数会在 级联选择器 tabs按钮发生变化的时候使用
    async getTabData() {
      // 证明选择的不是3级分类 我们要return出去 和 清空数组 效果就是点击了也没反应
      if(this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      let {data: res} = await request({
        url: `categories/${this.cateId}/attributes`,
        method: "get",
        params: {sel: this.activeName}
      })

      if(res.meta.status !== 200) {
         this.$message({
          type: "error",
          message: "获取分类信息失败",
          duration: 1000
        })
        return
      }

      // 再将数据交给 tab区对应的表格数据变量之前 我们加工下数据 将 attr_vals 的值 由字符串加工成一个数组
      res.data.forEach(item => {
        // 上下两种写法有什么区别么
        // if(item.attr_vals) {
        //   item.attr_vals = item.attr_vals.split(",")
        // } else {
        //   item.att_vals = []
        // }

        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : []

        // 为每一条记录添加一个布尔值 控制展开行的input的显示和隐藏
        item.inputVisible = false
        // 每一条记录 展开行中input的自己的v-model
        item.inputValue = ""
      })


      // 我们获取到的数据都是这个res.data 但是我们 动态参数要渲染一个表，静态属性也要渲染一个表 我们请求回来的数据应该保存到哪里呢？ 所以我们要进行判断
      if(this.activeName === "many") {
        this.manyTableData = res.data
        
      } else {
        this.onlyTableData = res.data
      }

      
    },

    async getCateList() {
      let {data: res} = await request({
        url: "/categories",
        method: "get"
      })

      if(res.meta.status !== 200) {
         this.$message({
          type: "error",
          message: "添加分类失败",
          duration: 1000
        })
        return
      }

      this.cateList = res.data
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
  .params {
    margin-top: 24px;
    font-size: 12px;
  }

  .cat_opt {
    margin:24px 0;
  }

  .cat_opt_title {
    font-size: 14px;
    margin-bottom: 6px;
    display: block;
  }

  .tab-area {
    font-size: 16px;
  }

  .el-table {
    margin-top: 24px;
  }

  .tag-content {
    margin: 8px;
  }

  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .el-tag + .el-tag {
    margin-left: 10px;
  }

  /deep/ .input-new-tag .el-input__inner {
    width: 120px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
