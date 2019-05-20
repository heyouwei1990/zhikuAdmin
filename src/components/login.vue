<template>
  <div class="login-page">
    <el-form ref="form" class='login-container' :model="form" :rules="rules">
      <h3>资库后台登录</h3>
      <el-form-item prop="userName">
        <el-input v-model="form.userName" placeholder="账号" type='text'  suffix-icon="el-icon-edit-outline"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="form.password" placeholder="密码" type='password' @keyup.enter.native="login" suffix-icon="el-icon-date"></el-input>
      </el-form-item>
      <el-form-item class='remember' >
        <el-checkbox v-model="remember">记住密码</el-checkbox>
      </el-form-item>
      <el-row>
        <el-button type="primary" class='btn' :loading="isLogin" @click='login'>登录</el-button>
      </el-row>
    </el-form>
  </div>
</template>

<script>
var sessionStorage = window.sessionStorage;
import axios from 'axios';
import qs from 'qs'
import tool from '@/vendor/tool'
export default {
  name: 'login',
  data () {
    return {
      form:{
        userName:"",
        password:"",
      },
      rules:{
        userName:[{required:true,message:'请输入用户名',trigger:'blur'}],
        password:[{required:true,message:'请输入密码',trigger:'blur'}],
      },
      isLogin:false,
      remember:false
    }
  },
  mounted(){
    this.getData();
  },
  methods:{
    getData(){
      var user=JSON.parse(tool.getLocal('loginInfo'));
      if(user){
        this.form.userName=user.userName;
        this.form.password=user.password;
        this.remember=user.remember;
      }
    },
    login(){
      this.$refs['form'].validate(valid=>{
        if(valid){
          var loginInfo={...this.form};
          loginInfo['remember']=this.remember;
          if(this.remember){
            tool.setLocal('loginInfo',loginInfo);
          }
          this.$post('/backend/admin/login',this.form).then(r=>{
            if(r.status==0){
              tool.setSession('userName',r.data.userName);
              tool.setSession('token',r.data.token);
              tool.setSession('rules',r.data.rules);
              this.$router.push({path:'/memberList'});
              this.$store.commit('setRules',r.data.rules);//设置权限
              this.$store.dispatch('getMenuList');//获取并设置全部菜单
            }else{
              this.$message.error(r.message);//登录失败，请联系管理员
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .login-page{
    position: fixed;
    left:0;
    top:0;
    width: 100%;
    height:100%;
    overflow: hidden;
    .login-container{
      border-radius: 5px;
      -moz-border-radius: 5px;
      background-clip: padding-box;
      margin: 0 auto;
      width: 350px;
      padding: 35px 35px 15px;
      background: #fff;
      border: 1px solid #eaeaea;
      box-shadow: 0 0 25px #cac6c6;
      margin-top:180px;
    }
    h3{
      width: 100%;
      text-align: center;
      padding:0;
      margin:0;
      margin-bottom: 40px;
    }
    .remember{
      margin-bottom:35px;
    }
    .btn{
      width: 100%;
      margin-bottom:15px;
    }
  }


</style>
