<template>
  <div>
    <div class="search">
      <el-form ref="form" :model="form">
        <el-button type="primary" size="small" @click="create" v-if='addIsShow'>添加管理员</el-button>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        v-loading="loading"
        highlight-current-row
        tooltip-effect="dark"
        @selection-change="handleSelectionChange"
        style="width: 100%">
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="userName" width="150" label="登录名"> </el-table-column>
        <el-table-column prop="email" min-width="150" label="用户邮箱"> </el-table-column>
        <el-table-column prop="roleName" min-width="150" label="用户角色"> </el-table-column>
        <el-table-column width="150" label="创建时间">
          <template slot-scope="scope">{{scope.row.addTime==0?"无":new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column width='150' label="最近登录时间">
          <template slot-scope="scope">{{scope.row.loginTime==0?"无":new Date(scope.row.loginTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="操作" width='150' show-overflow-tooltip v-if='editIsShow'>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)'>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini" type='danger' :disabled="delItems.length==0" @click="mulDelete">批量删除</el-button>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class='page'
        :current-page="pageIndex"
        :page-sizes="[1,10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"> </el-pagination>
    </div>
    <!--<el-dialog title="添加管理员" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="登录名">
          <el-input v-model="form.userName" placeholder="请输入登录名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="form.roleId">
            <el-option :label="item.name" :value="item.id" :key='item.id' v-for='item in roleData'></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>-->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="80px">
        <el-form-item label="登录名" prop="userName">
          <el-input v-model="editForm.userName" :disabled="editId>0" placeholder="请输入登录名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="editForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="用户角色" prop="roleId">
          <el-select v-model="editForm.roleId">
            <el-option :label="item.name" :value="item.id" :key='item.id' v-for='item in roleList'></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios';
  import qs from 'qs'
  import tool from '@/vendor/tool'
  import { mapState } from 'vuex'
export default {
  name: 'administ',
  data () {
    var validateEmail=(rule,value,callback)=>{
      if(!/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/g.test(value)){
        callback(new Error('邮箱格式不正确'))
      }else{
        callback();
      }
    };
    return {
      tableData: [],
      form: {
        userName: '',
        password: '',
        email:'',
        roleId:''
      },
      pageIndex:1,
      pageSize:10,
      total:0,
      delItems:[],
      loading: false,
      editVisible:false,
      editId:null,
      editTitle:'',
      editForm:{
        userName: '',
        email:'',
        password:'',
        roleId:'',
      },
      rules:{
        userName:[{required:true,message:'请输入登录名',trigger:'blur'}],
        email:[
          {required:true,message:'请输入邮箱',trigger:'blur'},
          {validator:validateEmail,trigger:'blur'}
        ],
        password:[{required:true,message:'请输入密码',trigger:'blur'}],
        roleId:[{required:true,message:'请选择角色',trigger:'blur'}],
      },
    }
  },
  created(){
    if(!this.roleList.length){
      this.$store.dispatch('getRoleList');
    }
  },
  mounted:function(){
    this.getData();
  },
  computed:{
    ...mapState({
      roleList:state=>state.roleList,
    }),
    editIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
    addIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
  },
  methods:{
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/admin/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
      }).then(r=>{
        this.loading=false;
        if(r.status==0){
          this.tableData=r.data;
          this.total=r.total;
        }
      }).catch(err=>{
        this.loading=false;
        this.$message.error(err.message);
      })
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData()
    },
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData()
    },
    //多选
    handleSelectionChange(data){
      this.delItems=data;
    },
    //批量删除
    mulDelete(){
      let ids=[];
      for(let i=0;i<this.delItems.length;i++){
        ids.push(this.delItems[i].id);
      }
      var idsStr=ids.join(',');
      this.$get('/backend/admin/deleteByIds',{
        ids:idsStr
      }).then(r=>{
        if(r.status==0){
          this.$message({
            showClose:true,
            message:'删除成功',
            type:'success'
          });
          this.getData();
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    create(){
      this.editTitle='添加管理员';
      this.editId=null;
      this.editVisible=true;
    },
    edit(item){
      this.editTitle='编辑管理员';
      this.editId=item.row.id;
      this.editForm.userName=item.row.userName;
      this.editForm.email=item.row.email;
      this.editForm.password=item.row.password;
      this.editForm.roleId=item.row.roleId;
      this.editVisible=true;
    },
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editForm.userName='';
      this.editForm.email='';
      this.editForm.password='';
      this.editForm.roleId='';
    },
    handleClose(done) {
      this.$confirm('确认关闭？').then(_ => {
        this.resetForm();
        this.editVisible=false;
      }).catch(_ => {});
    },
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          var params={...this.editForm};
          if(this.editId){
            params['id']=this.editId;
          }
          this.$post('/backend/admin/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              if(this.editId){
                this.$message.success('编辑成功');
              }else{
                this.$message.success('添加成功');
              }
              this.editVisible=false;
              this.resetForm();
              this.getData();
            }else{
              this.$message.error(r.message);
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    addRole(){
      var that = this;
      var data = that.form;
          data['token'] = window.sessionStorage.getItem("token");
          if(!reg.test(data['email'])){
            that.$message({
              showClose: true,
              message: '邮箱格式不正确',
              type: 'warning'
            });
            return;
          }
      axios.post(process.env.API_ROOT+'/adminstrator/add', qs.stringify(data),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.dialogVisible = false;
          that.$message({
            showClose: true,
            message: '添加成功',
            type: 'success'
          });
          that.init();
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'warning'
          });
        }
      })
      .catch(function(err){

      });
    },
    edit1(item){
      this.dialogVisible2 = true;
      var params = {};
      params['userName'] = item.row.user_name;
      params['email'] = item.row.email;
      params['id'] = item.row.id;
      params['role_id'] = item.row.role_id;
      this.editForm = params;
//      console.log(params)
    },
    editRole(){
      var that = this,params = this.editForm;
      params['token'] = window.sessionStorage.getItem("token");
      if(!reg.test(params['email'])){
        that.$message({
          showClose: true,
          message: '邮箱格式不正确',
          type: 'warning'
        });
        return
      }
      axios.post(process.env.API_ROOT+'/adminstrator/update', qs.stringify(this.editForm),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.$message({
            showClose: true,
            message: '修改成功',
            type: 'success'
          });
          that.dialogVisible2 = false;
          that.init();
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'warning'
          });
        }
      })
      .catch(function(err){

      });
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
