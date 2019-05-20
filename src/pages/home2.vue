<template>
  <el-container style='height:100%;'>
    <el-header>
      <top/>
    </el-header>
    <el-container style='height:100%;'>
      <el-aside style=' width:230px;height: 100%;'>
        <el-row class="tac" style="height: 100%;">
          <el-col :span="24" style="height: 100%;">
            <el-menu background-color="#eef1f6" class="el-menu-vertical-demo"
               unique-opened router  style="height: 100%;">
              <template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
                <el-submenu :index="index+''" v-if="!item.leaf">
                  <template slot="title"><i :class="item.icon"></i>{{item.name}}</template>
                  <el-menu-item v-for="child in item.children" :index="child.path" :key="child.path" v-if="!child.hidden">{{child.name}}</el-menu-item>
                </el-submenu>
              </template>
            </el-menu>
          </el-col>
        </el-row>
      </el-aside>
      <el-main style='height:100%;'>
        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
          <el-menu-item index="1">
            <router-link to='shareList'>分享管理</router-link>
          </el-menu-item>
          <el-menu-item index="2">
            <router-link to='commentList'>评论管理</router-link>
          </el-menu-item>
          <el-menu-item index="3">
            <router-link to='signUp'>报名管理</router-link>
          </el-menu-item>
        </el-menu>
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  import top from '@/components/top'
  import breadcrumb from '@/components/breadcrumb'
export default {
  name: 'home',
  components:{
    top
  },
  data () {
    return {
      activeIndex:'1'
    }
  },
  mounted:function(){
    this.$nextTick(()=>{

    })
  },
  methods:{
    handleSelect(){

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  html{
    height: 100%;
  }
  h1, h2 {
    font-weight: normal;
  }
  a {
    color: #409EFF;
    text-decoration: none;
    display: inline-block;
    width: 100%;
    height: 100%;
  }
  .el-form-item {
    margin-bottom: 10px;
  }
  table{
    border:1px solid #ccc;
  }
  .el-breadcrumb{
    margin-bottom: 20px;
  }
  .el-header{
    padding:0;
    margin:0;
  }
  .breadcrumb-container{
    overflow: hidden;
    font-size: 14px;
  }
  .title{
    float: left;
  }
  .breadcrumb-inner{
    float: right;
    font-size: 12px;
  }
  .el-menu--horizontal>.el-menu-item{
    height: 30px;
    line-height: 10px;
  }
</style>
