<template>
    <div class="main">
      <h1 @mouseover='mouseovers'>资库管理系统</h1>
      <el-dropdown style='float: right;'>
        <div class="userInfo">
          <span>{{userName}}</span>
          <img src="../assets/user3.png">
        </div>
        <el-dropdown-menu slot="dropdown" class='dropdown'>
          <el-dropdown-item @click.native='dialogVisible=true'>修改密码</el-dropdown-item>
          <el-dropdown-item @click.native="loginOut">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dialog
        title="修改密码"
        :visible.sync="dialogVisible"
        width="30%">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="原始密码" prop="password">
            <el-input v-model="form.password" type='password'></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="form.newPassword" type='password'></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="newPassword2">
            <el-input v-model="form.newPassword2" type='password'></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submit">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
  import tool from '@/vendor/tool'
export default {
  name: 'top',
  data () {
    var validatePassword=(rule,value,callback)=>{
      if(!/^(\w){6,20}$/g.test(value)){
        callback(new Error('请输入6-20位数字、字母'));
      }else{
        callback();
      }
    };
    var samePassword=(rule,value,callback)=>{
      if(value!=this.form.newPassword){
        callback(new Error('密码输入不一致，请重新输入'));
      }else{
        callback();
      }
    }
    return {
      dialogVisible:false,
      form:{
        password:"",
        newPassword:"",
        newPassword2:""
      },
      rules:{
        password:[{required:true,message:'请输入密码',trigger:'blur'}],
        newPassword:[
          {required:true,message:'请输入密码',trigger:'blur'},
          {validator:validatePassword, trigger:'blur'}
        ],
        newPassword2:[
          {required:true,message:'请输入密码',trigger:'blur'},
          {validator:samePassword, trigger:'blur'}
        ],
      },
      userName:""
    }
  },
  mounted:function(){
    this.$nextTick(()=>{
      this.userName = tool.getSession("userName");
    })
  },
  methods:{
    loginOut(){
      this.$confirm('将要退出, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        tool.removeSession("token");
        this.$router.push({path:"/"})
      }).catch(() => {

      });
    },
    submit(){
      this.$refs['form'].validate(valid=>{
        if(valid){
          var params={...this.form};
          delete params['newPassword2'];
          this.$post('/backend/admin/updatePassword',params).then(r=>{
            console.log(r);
            if(r.status==0){
              this.dialogVisible=false;
              this.$message.success('修改成功！');
              this.$router.push({path:'/'});
              tool.removeSession("token");
              tool.removeLocal("loginInfo");
            }else{
              this.$message.error(r.message);
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    mouseovers(){

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  html,body{
    width: 100%;
    height: 100%;
  }
  h1, h2 {
    font-weight: normal;
    padding:0;
    margin:0;
  }
  .main{
    width: 100%;
    height: 60px;
    line-height: 60px;
    background: #409EFF;
    overflow:hidden;
  }
  .main h1{
    height:60px;
    line-height: 60px;
    font-size: 22px;
    width: 189px;
    float: left;
    color: #fff;
    padding:0 20px;
    border-right: 1px solid #5eb9de;
  }
  .userInfo{
    float: right;
    height: 60px;
    line-height: 60px;
    padding-right: 40px;
    cursor: pointer;
  }
  .userInfo span{
    font-size: 14px;
    color: #fff;
  }
  .userInfo img{
    width: 40px;
    height: 40px;
    border-radius: 50%;
    vertical-align: middle;
    margin-top: -4px;
    margin-left: 10px;
  }
  .dropdown{
    width: 100px;
    text-align: center;
    margin-right: 5px;
    padding:10px 0;
    margin-top: 0;
  }
  img.screen{
    width: 30px;
    height: 30px;
    margin:15px;
  }
</style>
