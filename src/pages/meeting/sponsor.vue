<template>
  <div>
    <div class="search">
      <el-form ref="form" :model="form">
        <el-input v-model="form.phone" placeholder="会员手机号" style='width:200px; margin-right:10px;' @keyup.enter.native="onSubmit"></el-input>
        <el-input v-model="form.sponsorname" placeholder="主办方名称" style='width:200px; margin-right:10px;' @keyup.enter.native="onSubmit"></el-input>
        <el-select v-model="form.status" style='width: 100px;margin-right:10px;'>
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-button type="primary" size="small" @click="onSubmit">查询</el-button>
      </el-form>
    </div>
    <div class="table">
      <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" highlight-current-row style="width: 100%" @select='select' @select-all='select' @selection-change="handleSelectionChange" @cell-click='cellClick'>
        <!--<el-table-column type="selection" width="40"> </el-table-column>-->
        <el-table-column prop="sponsorid" label="序号" width="55"> </el-table-column>
        <el-table-column prop="user_name" label="会员昵称" width="120"> </el-table-column>
        <el-table-column prop="phone" label="会员手机号" width="120"> </el-table-column>
        <el-table-column prop="sponsorname" label="主办方名称" width="120"> </el-table-column>
        <el-table-column label="logo" width="120">
          <template slot-scope='scope'>
            <img :src="scope.row.sponsorurl">
          </template>
        </el-table-column>
        <el-table-column prop="sponsorphone" label="主办方联系方式" width="120"> </el-table-column>
        <el-table-column prop="name" label="变更时间" width="120">
          <template slot-scope="scope">{{new Date(scope.row.updatetime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope='scope'>{{scope.row.status==0?"关闭":"开启"}}</template>
        </el-table-column>
        <el-table-column prop="sponsorintro" show-overflow-tooltip label="主办方简介" min-width="120"> </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini"  v-if='delAll'>批量删除</el-button>
        <el-button size="mini" disabled v-else>批量删除</el-button>
      </div>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" class='page' :current-page="page" :page-sizes="[1,10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </div>
    <!-- 新建主办方 -->
    <el-dialog title="新建主办方" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="addForm" :model="addForm" label-width="110px">
        <el-form-item label="手机号">
          <el-input v-model="addForm.phone" @input='getPhone' placeholder='请输入手机号'></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="addForm.name" placeholder='请输入昵称'></el-input>
        </el-form-item>
        <el-form-item label="主办方名称">
          <el-input v-model="addForm.sponsorname" placeholder='请输入主办方名称'></el-input>
        </el-form-item>
        <el-form-item label="主办方联系方式">
          <el-input v-model="addForm.sponsorphone" placeholder='请输入主办方联系方式'></el-input>
        </el-form-item>
        <el-form-item label="主办方logo">
          <!--<uploadImg :type='type' :img='addForm.sponsorurl' @ievent="ievent"></uploadImg>-->
        </el-form-item>
        <el-form-item label="主办方简介">
          <el-input type="textarea" v-model="addForm.sponsorintro" placeholder='请输入主办方简介'></el-input>
        </el-form-item>
        <el-form-item label="主办方状态">
          <el-select v-model="addForm.status">
            <el-option v-for="item in options" :key="item.value" :disabled='dialogVisible&&!item.value?true:false' :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOnSumbit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改主办方 -->
    <el-dialog title="修改主办方" :visible.sync="dialogVisible2" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :model="editForm" label-width="110px">
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" disabled></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="主办方名称">
          <el-input v-model="editForm.sponsorname"></el-input>
        </el-form-item>
        <el-form-item label="主办方联系方式">
          <el-input v-model="editForm.sponsorphone"></el-input>
        </el-form-item>
        <el-form-item label="主办方logo">
          <!--<uploadImg :type='type' :img='editForm.sponsorurl' @ievent="ievent"></uploadImg>-->
        </el-form-item>
        <el-form-item label="主办方简介">
          <el-input type="textarea" v-model="editForm.sponsorintro"></el-input>
        </el-form-item>
        <el-form-item label="主办方状态">
          <el-select v-model="editForm.status">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="editOnSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios';
  import qs from 'qs'
//  import uploadImg from '@/components/uploadImg'
//  import { imgUrl } from '../../../config/common';
export default {
  name: 'lecturerList',
  components:{
//    uploadImg
  },
  data () {
    return {
      type:"backgroundurl",
      tableData: [],
      form:{
        phone:'',
        sponsorname:'',
        status:''
      },
      addForm: {
        name:'',
        phone:'',
        user_auth_id:'',
        sponsorname:'',
        sponsorurl:'',
        sponsorphone:'',
        sponsorintro:'',
        status:''
      },
      editForm: {
        name:'',
        phone:'',
        id:'',
        sponsorname:'',
        sponsorurl:'',
        sponsorphone:'',
        sponsorintro:'',
        status:''
      },
      options: [{
        value: '',
        label: '全部'
      }, {
        value: '0',
        label: '关闭'
      }, {
        value: '1',
        label: '开启'
      }],
      delAll:false,
      dialogVisible:false,
      dialogVisible2:false,
      page:1,
      total:1,
      pageSize:20,
      addIsShow:false,
      editIsShow:false
    }
  },
  mounted(){
    this.init(this.form)
    this.getStorage();
  },
  methods:{
    cellClick(e){
      this.$emit('ievent3', e);
    },
    handleSelectionChange(e){
      // console.log(e)
    },
    select(e){
      var len = e.length;
      if(len){
        this.delAll = true
      }else{
        this.delAll = false
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.init(this.form)
    },
    handleCurrentChange(val) {
      this.page = val;
      this.init(this.form)
    },
    onSubmit(){
      this.init(this.form)
    },
    addOnSumbit(){
      var params = this.addForm,
          that = this;
          params['sponsorurl'] = this.type+"/"+params['sponsorurl'].split("/")[4]
      if(!params['user_auth_id']){
        that.$message({
          showClose: true,
          message: '请先创建会员',
          type: 'success'
        });
        return;
      }
      params['token'] = window.sessionStorage.getItem("token");

      axios.post(process.env.API_ROOT+'/sponsor/add', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.init(that.form);
          that.dialogVisible = false;
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
      })
      .catch(function(err){

      });
    },
    editOnSubmit(){
      var params = this.editForm,
          that = this;
      params['token'] = window.sessionStorage.getItem("token");
      params['sponsorurl'] = this.type+'/'+params['sponsorurl'].split("/")[4];
      console.log(params);
      axios.post(process.env.API_ROOT+'/sponsor/update', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.init(that.form);
          that.dialogVisible2 = false;
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
      })
      .catch(function(err){

      });
    },
    ievent(e){
      var url = e.data.url;
      this.editForm.sponsorurl = imgUrl()+"/"+this.type+"/"+url;
      this.addForm.sponsorurl = imgUrl()+"/"+this.type+"/"+url;
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    edit(item){
      this.dialogVisible2 = true;
      this.editForm.sponsorurl = item.row.sponsorurl;
      this.editForm.phone = item.row.phone;
      this.editForm.id = item.row.sponsorid;
      this.editForm.name = item.row.user_name;
      this.editForm.sponsorname = item.row.sponsorname;
      this.editForm.sponsorphone = item.row.sponsorphone;
      this.editForm.sponsorintro = item.row.sponsorintro;
      this.editForm.status = item.row.status;
    },
    getPhone(){
      var that = this;
      if(this.addForm.phone.length==11){
        var params = {};
        params['token'] = window.sessionStorage.getItem("token");
        params['phone'] = this.addForm.phone;
        axios.post(process.env.API_ROOT+'/user/getbyphone', qs.stringify(params),{
          headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(function(res){
          var status=res.data.status;
          if(status==0){
            var user_auth_id = res.data.data.user_auth_id;
            that.addForm.name = res.data.data.name;
            that.addForm.user_auth_id = user_auth_id;
          }else{
            that.$message({
              showClose: true,
              message: res.data.message,
              type: 'success'
            });
          }
        })
        .catch(function(err){

        });
      }
    },
    init(params){
      var that = this;
      params['token'] = window.sessionStorage.getItem("token");
      params['page'] = that.page;
      params['pageSize'] = that.pageSize;
      axios.post(process.env.API_ROOT+'/sponsor/index', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          var list = res.data.data.list;
          if(list){
            for(var i =0;i<list.length;i++){
              list[i]['sponsorurl'] = imgUrl()+"/"+list[i]['sponsorurl']
            }
            that.tableData = list;
            that.total = Number(res.data.data.pager.Counts)
            that.page = res.data.data.pager.page;
          }else{
            that.tableData = [];
            that.total = 1;
            that.page = 1;
          }

        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
      })
      .catch(function(err){

      });
    },
    getStorage(){
      var menuList = window.sessionStorage.getItem("menuList");
      var data = JSON.parse(menuList);
      for(var i = 0;i<data.length;i++){
        if(data[i]['action_id']=='sponsor/update'){
          if(data[i]['show_button']==1){
            this.editIsShow = true;
          }else{
            this.editIsShow = false;
          }
        }
        if(data[i]['action_id']=='sponsor/add'){
          if(data[i]['show_button']==1){
            this.addIsShow = true;
          }else{
            this.addIsShow = false;
          }
        }
      }
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
    color: #42b983;
  }
  .el-form-item{
    margin-bottom: 10px;
  }
  img{
    width: 60px;
    height: 60px;
    border-radius: 50%
  }
</style>
