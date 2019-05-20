<template>
  <el-aside style=' width:230px;height: 100%;'>
    <el-row class="tac" style="height: 100%;">
      <el-col :span="24" style="height: 100%;">
        <el-menu background-color="#eef1f6" class="el-menu-vertical-demo"
           unique-opened router  style="height: 100%;">
          <template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
            <el-submenu :index="index+''">
              <template slot="title"><i :class="item.icon"></i>{{item.name}}</template>
              <el-menu-item v-for="child in item.children" :index="child.path" :key="child.path" v-if="!child.hidden">{{child.name}}</el-menu-item>
            </el-submenu>
          </template>
        </el-menu>
      </el-col>
    </el-row>
  </el-aside>
</template>
<script>
export default {
  data () {
    return {

    }
  },
  methods: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  html,body{
    height:100%;
    background-color: none;
  }
  .section{
    width: 100%;
    height: 100%;
    background: #eef1f6;
  }
  .tac{
    width: 100%;
    height: 100%;
    background: none
  }
  a{
    color: #333;
    text-decoration: none;
  }
  .el-col-24 {
    width: 100%;
    height: 100%;
    border:none;
  }
  .el-menu-vertical-demo{
    border:none;
  }

  .fw{
    /*font-weight: bold;*/
  }
  .el-submenu .el-menu {
    background-color: #e4e8f1;
  }
</style>
