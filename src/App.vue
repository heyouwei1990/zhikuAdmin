<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
  body,html{
    padding:0;
    margin:0;
    height: 100%;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin: 0;
    padding:0;
    width: 100%;
    height: 100%;
  }
  .el-menu-item-group .el-menu-item-group__title{
    padding:0;
    margin:0;
  }
  .top{
    width: 100%;
    height: 60px;
  }
  .main{
    width: 100%;
    height: 100%;
    overflow:hidden;
  }
  .main .menu{
    width: 230px;
    min-height: 100%;
    background: #eef1f6;
    float: left;
  }
  .search{
    width: calc(100%-20px);
    background: #f2f2f2;
    margin: 10px auto;
    padding: 10px;
    overflow: hidden;
  }
  .create{
    float: right;
    margin-right: 20px;
    margin-top: 4px;
  }
  .table{
    width: 100%;
    border:1px solid #f5f5f5;
    border-bottom: none;
  }
  #page{
    margin-top:10px;
    overflow: hidden;
    height: 40px;
    line-height: 40px;
    background: #f2f2f2;
  }
  #page .batch{
    float: left;
    padding-left: 10px;
  }
  #page .page{
    float: right;
    height: 40px;
    line-height: 40px;
    padding-top: 5px;
    padding-right: 10px;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: all .2s ease;
  }

  .fade-enter,
  .fade-leave-active {
    opacity: 0;
  }
  .clearfix{
    clear: both;
  }
  .clearfix:after{
    content: '';
    display: block;
  }
</style>
