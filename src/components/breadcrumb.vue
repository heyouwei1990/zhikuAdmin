<template>
  <!-- <div class="breadcrumb-container">
    <strong>{{message}}</strong>
    <img src="../assets/xiegang.png" class="xiegang">
    <span style="color: #97a8be;font-size:11px;cursor: text;">{{subMessage}}</span>
    <div class="el-breadcrumb" style="display: none">
      <span>导航一</span>
      <span style="margin:0 10px;">/</span>
      <span>From</span>
    </div>
  </div> -->
  <el-breadcrumb separator="/" style='width:calc(100%-40px);display: block;'>
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item><a href="/">活动管理</a></el-breadcrumb-item>
    <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    <el-breadcrumb-item>活动详情</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: 'breadcrumb',
  data () {
    return {
      title:""
    }
  },
  props:["message","subMessage"],
  mounted(){

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
  .breadcrumb-container{
    width: 100%;
    height: 20px;
    line-height: 20px;
    overflow:hidden;
  }
  strong{
    float: left;
    color: #475669;
    font-size: 14px;
  }
  .el-breadcrumb{
    float: right;
    font-size: 13px;
    height: 20px;
    line-height: 20px;
  }
  img.xiegang{
    width: 10px;
    height: 10px;
    margin:0 2px 0 5px;
  }
</style>
