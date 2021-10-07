<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card class="usersList">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="24">
        <el-col :span="8">
          <div>
            <el-input 
              clearable placeholder="请输入内容" 
              size="small" 
              v-model="queryInfo.query"
              @clear="getUsersList"
            >
              <el-button
                size="small"
                slot="append"
                icon="el-icon-search"
                @click="getUsersList"
              ></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" size="small" @click="openUser">添加用户</el-button>
        </el-col>
      </el-row>
      <div class="table-wrap">
        <el-table
          :data="userList"
          border
          stripe
        >
          <el-table-column type="index" label="序号" align="center"></el-table-column>
          <el-table-column 
            v-for="item of this.columnData" 
            :key="item.id" 
            v-bind="item"
          >
            <template scope="scope" v-if="item.type == 'switch'">
              <el-switch
                v-model="scope.row.mg_state"
                @change="userStateChange(scope.row)"
              >
              </el-switch>
            </template>

            <template scope="scope" v-else>
              {{showData(scope.row, item.prop)}}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200">
            <template scope="scope">
              <el-button @click="openUpdateUser(scope.row.id)" type="primary" icon="el-icon-edit" size="mini"></el-button>
              <el-button @click="removeUserById(scope.row)" type="danger" icon="el-icon-delete" size="mini"></el-button>
              <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-share" size="mini"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>

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

      <!-- 添加用户的对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="dialogVisible"
        width="50%"
        @close="dialogClose"
      >
        <!-- 这就是内容主体区 -->
        <el-form 
          :model="addForm" 
          :rules="addFormRules" 
          ref="addFormRef" 
          label-width="70px" 
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <!-- 对话框底部的按钮区 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addUser">确定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑用户信息的对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="updateDialogVisible"
        width="50%"
        @close="updataFormClose"
      >
        <el-form 
          :model="updateForm" 
          :rules="updateFormRules" 
          ref="updateFormRef" 
          label-width="70px"
        >
          <el-form-item label="用户名">
            <el-input disabled v-model="updateForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="updateForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="updateForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="updateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editUserInfo">确定</el-button>
        </span>
      </el-dialog>


    </el-card>
  </div>
  
</template>

<script>
import {request} from "../../network/request"
export default {
  name: "User",
  data() {

    // 定义 添加用户 时的校验规则
    let checkMail = (rule, value, callback) => {
      let reg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
      if(reg.test(value)) {

        // 合法的邮箱
        return callback()
      } else {
        return callback(new Error("您输入的邮箱不合法"))
      }
    }

    let checkMobile = (rule, value, callback) => {
      let reg = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/
      if(reg.test(value)) {

        // 合法电话
        return callback()
      } else {
        return callback(new Error("您输入的电话不合法"))
      }
    }

    return {
      // 添加用户的表单数据
      addForm:{
        username: "",
        password: "",
        email: "12222222@mail.com",
        mobile: "18698722099"
      },

      // 添加用户表单的验证规则
      addFormRules:{
        username: [
          {required: true, message: "请输入用户名", trigger: "blur"},
          {min:4, max: 10, message: "用户名的长度要在3 ~ 10个字符之间", trigger: "blur"}
        ],
        password: [
          {required: true, message: "请输入密码", trigger: "blur"},
          {min:6, max: 15, message: "密码的长度要在6 ~ 15个字符之间", trigger: "blur"}
        ],
        email: [
          // 校验是否输入了邮箱
          {required: true, message: "请输入邮箱", trigger: "blur"},
          // 校验输入的是否合法
          {validator: checkMail, trigger: "blur"}
        ],
        mobile: [
          {required: true, message: "请输入邮箱", trigger: "blur"},
          {validator: checkMobile, trigger: "blur"}
        ]
      },

      // 控制对话框的显示和隐藏
      dialogVisible:false,

      // 控制编辑对话框的显示和隐藏
      updateDialogVisible: false,

      columnData:[
        {
          prop: "username",
          label: "用户名",
          minWidth: 100,
        },
        {
          prop: "email",
          label: "邮箱",
          minWidth: 150,
        },
        {
          prop: "mobile",
          label: "电话",
          minWidth: 150,
        },
        {
          prop: "role_name",
          label: "角色",
          minWidth: 100,
        },
        {
          prop: "mg_state",
          label: "状态",
          minWidth: 100,
          type: "switch"
        },
      ],
      userList: [],
      total: 0,
      queryInfo: {
        query: "",
        // 当前页码
        pagenum: 1,
        // 一页显示多少条数据
        pagesize: 5
      },

      // 查询到的用户信息对象 这个对象不赋值初始值的原因是当点击对话框时发起了数据请求 请求结果保存在这里对象中了
      updateForm: {},

      // 编辑用户信息的表单验证规则对象
      updateFormRules: {
        email: [
          // 校验是否输入了邮箱
          {required: true, message: "请输入邮箱", trigger: "blur"},
          // 校验输入的是否合法
          {validator: checkMail, trigger: "blur"}
        ],
        mobile: [
          {required: true, message: "请输入邮箱", trigger: "blur"},
          {validator: checkMobile, trigger: "blur"}
        ]
      }
    }
  },

  methods: {
    // 根据id删除对应的用户信息
    async removeUserById(row) {
      // 先弹框进行提示
      let res = await this.$confirm(`此操作将永久删除 ${row.username}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(res !== "confirm") {
        return  this.$message.info("已经取消删除")
      }

      let {data: resMsg} = await request({
        url: `users/${row.id}`,
        method: "delete"
      })

      if(resMsg.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "用户删除失败",
          duration: 1000
        })
        return
      }

      this.$message({
        type: "success",
        message: "用户删除成功",
        duration: 1000
      })

      // 删除成功后要刷新列表
      this.getUsersList()
    },
   

    // 编辑按钮 中的对话框的确定按钮事件 
    editUserInfo() {
      // 我们在这里进行修改用户信息 填写的数据的预校验 与 提交
      this.$refs.updateFormRef.validate( async (valid) => {
        if(!valid) return

        // 发起修改请求
        // updateForm 这个对象是我们打开编辑用户信息的按钮是 请求回来的该行这个人的数据 里面有id
        let {data: res} = await request({
          url: `users/${this.updateForm.id}`,
          method: "put",
          data: {
            email: this.updateForm.email,
            mobile: this.updateForm.mobile
          } 
        })
        if(res.meta.status !== 200) {
          this.$message({
            type: "error",
            message: "用户更新失败",
            duration: 1000
          })
          return
        }

        // 先关闭对话框
        this.updateDialogVisible = false;

         // 刷新数据列表
        this.getUsersList()

        // 提示修改成功
        this.$message({
          type: "success",
          message: "用户数据更新成功",
          duration: 1000
        })
      })
    },

    // 当关闭 编辑用户 按钮展示的对话框的时候 重置信息
    updataFormClose() {
      this.$refs.updateFormRef.resetFields()
    },

    // 打开编辑用户信息的回调
    async openUpdateUser(id) {
      let {data: res} = await request({
        url: `users/${id}`,
        method: "get"
      })

      if(res.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: "查询用户信息出错",
          duration: 1000
        })
      }

      // 如果没有return出去说明查询用户信息成功 那我们就把查询到的结果 保存起供页面来使用
      this.updateForm = res.data
      this.updateDialogVisible = true
    },

    // 在添加用户的对话框中 点击确定 添加用户
    addUser() {
      // 在这里 我们首先要对整个表单进行预校验
      this.$refs.addFormRef.validate(async (valid) => {

        // 如果验证没有通过 我们就不走 添加的逻辑了
        if(!valid) return

        // 如果验证没有通过 那么我们就可以开始 走添加的逻辑了 发起添加用户的请求
        let {data: res} = await request({
          url: "/users",
          method: "post",
          data: this.addForm
        })

        console.log(res)
        if(res.meta.status !== 201) {
          this.$message({
            type: "error",
            message: "添加用户失败",
            duration: 1000
          })
        }

        this.$message({
          type: "success",
          message: "添加用户成功",
          duration: 1000
        })

        this.dialogVisible = false

        // 我们添加了一个新用户后 别忘记还需要刷新用户列表
        this.getUsersList()
      })
    },

    // 点击添加用户按钮 打开对话框
    openUser() {
      this.dialogVisible = true
    },

    // 关闭对话框时重置添加用户的表单
    dialogClose() {
      this.$refs.addFormRef.resetFields()
    },

    // 监听 switch 开关状态的改变
    async userStateChange(userInfo) {
      // 获取到最新的用户状态之后 发起请求 修改数据库
      let {data: res} = await request({
        url: `users/${userInfo.id}/state/${userInfo.mg_state}`,
        method: "put"
      })

      if(res.meta.status !== 200) {
        // 这里要注意 因为没有成功修改数据库 但是前端页面的显示效果发生了变化 变成了true 所以我们要将true修改回去false
        userInfo.mg_state = !userInfo.mg_state
        this.$message({
          type: "error",
          message: "更新用户数据出错",
          duration: 1000
        })
        return
      }

      // 更新状态成功
      this.$message({
        type: "success",
        message: "更新状态成功",
        duration: 1000
      })
    },

    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // 我们将用户选择的newSize 赋值给 data配置项中的  queryInfo.pagesize
      this.queryInfo.pagesize = newSize

      // 既然我们用户选择了最新的 pagesize 那么我们就需要拿着这个最新的pagesize 去请求数据
      this.getUsersList()
    },

    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUsersList()
    },

    async getUsersList() {
      let {data :res} = await request({
        url: "/users",
        method: "get",
        params: this.queryInfo
      })
      
      // 根据服务器返回的状态码判断
      if(res.meta.status !== 200) return this.$message({
        message: "获取用户数据失败",
        type: "error",
        duration: 1000
      })

      // 如果没有return出去那么代表用户获取成功
      this.userList = res.data.users
      this.total = res.data.total
    }
  },
  created() {
    this.getUsersList()
  },
  computed: {
    showData() {
      return (row, prop) => {
        return row[prop]
      }
    }
  }
}
</script>

<style scoped>
  .usersList {
    margin-top: 24px;
    font-size: 12px;
  }
  .table-wrap {
    margin-top: 24px;
  }

  .el-table {
    font-size: 12px;
  }

  .el-pagination {
    margin-top: 24px;
  }
</style>