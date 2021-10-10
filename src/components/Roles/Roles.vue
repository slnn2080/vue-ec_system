<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="roles">
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="rolesList"
        border
        stripe
        class="roles-table"
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template scope="scope">
            <el-row 
              v-for="(item, index1) of scope.row.children" 
              :key="item.id"
              class="tag-wrap"
              :class="['tag-row-bottom', index1 === 0 ? 'tag-row-top' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <div>
                  <el-tag
                    closable 
                    @close="removeItemById(scope.row, item.id)"
                  >{{item.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </div>
              </el-col>

              <!-- 渲染二 三级权限 -->
              <el-col :span="19">
                <div>
                  <!-- 通过for循环嵌套渲染二级权限 -->
                  <el-row 
                    v-for="(i, index2) of item.children" 
                    :key="i.id"
                    :class="[index2 == 0 ? '' : 'tag-row-top', 'vcenter']"
                  >
                    <!-- 二级权限 -->
                    <el-col :span="5">
                      <div>
                        <el-tag 
                          type="success"
                          closable 
                          @close="removeItemById(scope.row, i.id)"
                        >{{i.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </div>
                    </el-col>
                    <!-- 三级权限 -->
                    <el-col :span="19">
                      <div>
                        <el-tag 
                          type="warning" 
                          v-for="(ii, index3) of i.children"
                          :key="ii.id"
                          closable 
                          @close="removeItemById(scope.row, ii.id)"
                        >
                          {{ii.authName}}
                        </el-tag>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 索引列 -->
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column
          v-for="item of columnData"
          :key="item.id"
          v-bind="item"
        >

        </el-table-column>

        <!-- 按钮列 -->
        <el-table-column label="操作" min-width="100">
          <template scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button 
              type="warning" 
              icon="el-icon-share" 
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree 
        ref="treeRef"
        :data="rightsList" 
        :props="treeProps" 
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button 
          @click="setRightDialogVisible = false"
        >
        取消</el-button>
        <el-button type="primary" 
          @click="allotRights"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {request} from "../../network/request"
export default {
  name:"Roles",
  data() {
    return {
      // 当前即将分配权限的id
      roleId: "",
      // tree组件 用户权限对应体现 默认选中的节点id值数组
      defKeys: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName"
      },
      // 控制点击分配权限按钮 是否展示对话框
      setRightDialogVisible:false,
      rolesList: [],
      columnData:[
        {
          prop: "roleName",
          label: "角色名称",
          minWidth: 100,
        },
        {
          prop: "roleDesc",
          label: "角色描述",
          minWidth: 100,
        }
      ],
      // 所有权限的数据
      rightsList: []
    }
  },
  methods: {
    // 点击确认按钮 为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      // 将获取到的数组拼接成一个以逗号分隔的字符串
      let idStr = keys.join(",")
      
      let {data: res} = await request({
        url: `roles/${this.roleId}/rights`,
        method: "post",
        data: {
          rids: idStr
        }
      })

      if(res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "用户更新权限失败",
          duration: 1000
        })
        return
      }
      
      this.getRolesList()
      this.$message({
        type: "success",
        message: "用户更新权限成功",
        duration: 1000
      })
      this.setRightDialogVisible = false
    },

    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },

    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      let {data: res} = await request({
        url: `rights/tree`,
        method: "get"
      })
      if(res.meta.status !== 200) {
        this.$message({
          type: "info",
          message: "获取权限列表失败",
          duration: 1000
        })
        return
      }
      this.rightsList = res.data
      // 递归获取三级节点的id
      console.log(role)
      this.getLeafKeys(role, this.defKeys)
      
      this.setRightDialogVisible = true
    },
    
    // 根据id删除对应的权限
    async removeItemById(role, rightId) {
      // 弹窗提示用户是否删除
      let deleteInfo = await this.$confirm("此操作将永久删除权限信息", "删除提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)

      if(deleteInfo !== "confirm") {
        this.$message({
          type: "info",
          message: "取消了删除",
          duration: 1000
        })
        return
      }

      // 发起删除对应权限的请求
      let {data: res} = await request({
        url:`roles/${role.id}/rights/${rightId}`,
        method: "delete"
      })

      if(res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "删除权限失败",
          duration: 1000
        })
        return
      }

      this.$message({
        type: "success",
        message: "删除数据成功",
        duration: 1000
      })

      // this.getRolesList()
      role.children = res.data
    },

    async getRolesList() {
      let {data: res} = await request({
        url: "/roles",
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

      this.rolesList = res.data
    },

    // 通过递归的形式 获取角色下所有三级权限的id 并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // node用来判断是否是3级权限节点 是否为3级节点我们可以判断它是否包含children属性

      // 如果该节点包含了children属性 证明它不是三级节点 如果没有children属性则证明它是三级节点
      if(!node.children) {
        return arr.push(node.id)
      } else {
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      }
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>

<style scoped>
  .roles {
    margin-top: 24px;
    font-size: 12px;
  }

  .roles-table {
    margin: 24px 0;
  }

  .tag-row-bottom {
    border-bottom: 1px solid #eee;
  }
  .tag-row-top {
    border-top: 1px solid #eee;
  }
  /* .tag-wrap {
    margin: 6px 0px;
  } */

  .el-tag {
    margin: 6px 6px 6px 0px;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
  
</style>