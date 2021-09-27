<template>
  <div>
    <h3>Home</h3>
    <el-button type="danger" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  name: "Home",
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push("/login")
    }
  }
}
</script>

<style>

</style>