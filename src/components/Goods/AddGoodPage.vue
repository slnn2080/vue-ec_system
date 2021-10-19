<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

     <!-- 卡片视图区 -->
    <el-card class="add_good">
      <!-- 警告区 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 步骤条区 -->
      <el-steps 
        :space="200" 
        :active="activeIndex / 1" 
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form 
        :model="addForm" 
        :rules="addFormRules" 
        ref="addFormRef" 
        label-width="100px" 
        label-position="top"
      >
        <!-- tab栏区域 -->
        <el-tabs 
          :tab-position="'left'" 
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 选择商品分类的级联选择框 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
                clearable
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 这里也是一个form-item 我们在这里将获取的数据 渲染成复选框组 -->
            <el-form-item 
              v-for="item of manyTableData" 
              :label="item.attr_name" 
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox 
                  v-for="(i, k) of item.attr_vals" 
                  :keys="k" 
                  :label="i"
                  border
                >
                </el-checkbox>
              </el-checkbox-group>

            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item 
              v-for="item of this.onlyTableData" 
              :key="item.attr_id" 
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%"
    >
      <img :src="preview" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import {request} from "../../network/request"
import _ from "lodash"

export default {
  name: "AddGoodPage",
  data() {
    return {
      // 图片预览的对话框
      previewVisible: false,

      // upload组件图片预览的url
      preview: "",

      // upload组件的请求头配置对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      // tabs 商品参数 区 的数据
      manyTableData: [],
      onlyTableData: [],

      // 级联选择器的配置对象
      cateProps: {
        expandTrigger: 'hover',
        // 看到的是哪个属性
        label: "cat_name",
        // 选中的是哪个属性
        value: "cat_id",
        children: "children",
        checkStrictly: false,
      },

      // 商品分类数据
      cateList: [],

      // 添加商品的表单数据对象
      addForm: {
        goods_name:"",
        goods_price:0,
        goods_weight:0,
        goods_number: 0,
        // 商品所属的分类数组，但是提交的时候要转成逗号分隔的字符串 级联选择器的id值会保存在这里
        goods_cat: [],

        // upload组件 图片上传 存放临时路径的数组
        pics: [],
        // 商品详情描述 富文本编辑器绑定的变量
        goods_introduce: "",
        attrs: []
      },
      addFormRules:{
        goods_name: [
          {required: true, message: "请输入商品名称", trigger: "blur"}
        ],
        goods_price: [
          {required: true, message: "请输入商品价格", trigger: "blur"}
        ],
        goods_weight: [
          {required: true, message: "请输入商品重量", trigger: "blur"}
        ],
        goods_number: [
          {required: true, message: "请输入商品数量", trigger: "blur"}
        ],
        goods_cat:[
          {required: true, message: "请选择商品分类", trigger: "blur"}
        ]
      },
      activeIndex: "0"
    }
  },
  computed: {
    catId() {
      if(this.addForm.goods_cat && this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
      }

      return null
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) {
          this.$message.error("请填写必要的表单项目")
          return
        }

        // 如果没有问题我们就开心添加的逻辑

        // 处理数据成服务器符合服务器要求的格式 比如这里我们要将goods_cat改成字符串格式

        // this.addForm.goods_cat = this.addForm.goods_cat.join(",") 因为浅拷贝的原因关联了发起请求要求 和 级联选择器 会产生冲突所以在发起请求之前我们先对addForm进行一下深拷贝 形成一个全新的对象
        let form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(",")

        // 我们遍历manyonlyTableData这两个数组，并做处理 将处理好的结果push到attrs数组中
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(",")
          }
          this.addForm.attrs.push(newInfo)
        })

        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,

            // 静态属性的value值本来就一个字符串
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })

        // 因为两个对象没有关联 但是我们在最后提交的时候 提交的是form所以我们要把整理好的数据给form份
        form.attrs = this.addForm.attrs
        console.log(form)

        // 发起请求添加商品 商品的名称必须是唯一的 两个商品名称如果一样就会报错
        let {data: res} = await request({
          url: "/goods",
          method: "post",
          data: form
        })

        if(res.meta.status !== 201) {
          this.$message.error("添加商品失败")
          return
        }

        this.$message.success("添加商品成功")

        // 添加商品成功后跳转到商品列表页面
        this.$router.push("/goods")
      })
    },

    // upload组件上传图片成功后的回调
    handleSuccess(res, file, filelist) {
      // 拼接一个图片信息对象
      const picInfo = {
        pic: res.data.tmp_path
      }

      // 将图片信息对象 push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log("上传成功后 图片数组的信息", this.addForm.pics)
    },

    // 处理图片预览效果
    handlePreview(file) {
      this.preview = file.response.data.url
      this.previewVisible = true
    },

    // 处理移除图片的操作
    handleRemove(file) {
      // file 将要被移除的图片信息 我们要根据图片的临时路径 从pics中查到对应那一项的索引值 然后根据索引值删除它
      const filePath = file.response.data.tmp_path
      let index = this.addForm.pics.findIndex((item) => {
        return item.pic = filePath
      })
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },

    // tabs各标签页按钮被点击的时候会触发
    async tabClick() {
      // console.log(this.activeIndex)
      // 证明我们访问的商品参数的面板
      if(this.activeIndex == "1") {
        let {data: res} = await request({
          url: `categories/${this.catId}/attributes`,
          method: "get",
          params: {sel: "many"}
        })
        if(res.meta.status !== 200) {
          this.$message.error("请求商品参数失败")
          return
        }
        res.data.forEach(item => {
          // 我们要做判断 如果是空字符串那么我们就返回空数组
          item.attr_vals = item.attr_vals.length == 0 ? [] : item.attr_vals.split(",")
        })
        this.manyTableData = res.data
      }

      // tabs 请求 商品属性 数据
      if(this.activeIndex == "2") {
        let {data: res} = await request({
          url: `categories/${this.catId}/attributes`,
          method: "get",
          params: {sel: "only"}
        })

        if(res.meta.status !== 200) {
          this.$message.error("请求商品参数失败")
          return
        }
        
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },

    // 当tabs标签页切换之前的回调
    beforeTabLeave(to, from) {
      // console.log("即将进入的标签页的名称", to)
      // console.log("即将离开的标签页的名称", from)

      if(from == "0" && this.addForm.goods_cat.length != 3) {
        this.$message.error("请先选择商品分类")
        return false 
      }
    },

    // 级联选择器 选中项发生变化 会触发这个函数
    handleChange() {
      if(this.addForm.goods_cat.length != 3) {
        // 进入到这里代理你没有选中3级分类 我们直接清空该数组
        this.addForm.goods_cat = []
      } 
    },
    async getCateList() {
      let {data: res} = await request({
        url: "/categories",
        method: "get"
      })

      if(res.meta.status !== 200) return this.$message.error("获取分类数据失败")
      this.cateList = res.data
    }
  }
}
</script>

<style scoped lang="less">
  .add_good {
    margin-top: 24px;

    .el-steps {
      margin: 24px 0;
    }

    /deep/ .el-step__title {
      font-size: 13px;;
    }

    .el-checkbox {
      margin: 0;
    }

    .previewImg {
      width: 100%;
    }
  }

  /deep/ .ql-editor {
    min-height: 300px;
  }

  .btnAdd {
    margin-top: 15px;
  }
</style>