<template>
  <div>
    <div class="search">
      <el-form ref="form1" :inline="true" :model="form1">
        <el-form-item label="会员手机号" >
          <el-input v-model="form1.phone" placeholder="请输入会员手机号" @keyup.enter.native="onSubmit"></el-input>
        </el-form-item>
        <el-form-item >
          <el-button type="primary" size="small" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table ref="multipleTable" :data="tableData" v-loading='loading' tooltip-effect="dark" highlight-current-row style="width: 100%">
        <el-table-column prop="nick_name" label="会员昵称"> </el-table-column>
        <el-table-column prop="phone" label="会员手机号"> </el-table-column>
        <el-table-column prop="country" label="会员所属地区">
          <template slot-scope="scope">{{scope.row.province}} - {{scope.row.city}} - {{scope.row.district}}</template>
        </el-table-column>
        <el-table-column prop="real_name" label="真实姓名"> </el-table-column>
        <el-table-column label="修改时间">
          <template slot-scope="scope">{{scope.row.updatetime==0?'无修改时间':new Date(scope.row.updatetime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="update_remark" label="备注"> </el-table-column>
        <el-table-column label="操作" show-overflow-tooltip v-if='editIsShow||resetIsShow'>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)' v-show='editIsShow'>编辑</el-button>
            <el-button size="mini" type="danger" @click='reset(item)' v-show='resetIsShow'>重置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" class='page' :current-page="page" :page-sizes="[1,10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="form2" :model="form2" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="form2.phone"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" placeholder="请输入真实姓名">
          <el-input v-model="form2.real_name"></el-input>
        </el-form-item>
        <el-form-item label="所属区域">
          <el-row>
            <el-col :span="6">
              <el-select v-model="form2.province" @change='getProvinceId'>
                <el-option v-for="item in provinceOptions" :key="item.provinceid" :label="item.province" :value="item.province+'*'+item.provinceid"> </el-option>
              </el-select>
            </el-col>
            <el-col :span="7" :offset='2'>
              <el-select v-model="form2.city" @change='getCityId'>
                <el-option v-for="item in cityOptions" :key="item.cityid" :label="item.city" :value="item.city+'*'+item.cityid"> </el-option>
              </el-select>
            </el-col>
            <el-col :span="7" :offset='2'>
              <el-select v-model="form2.district" @change='getAreaId'>
                <el-option v-for="item in areaOptions" :key="item.areaid" :label="item.area" :value="item.area+'*'+item.areaid"> </el-option>
              </el-select>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="uplocBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios';
  import qs from 'qs'
export default {
  name: 'authList',
  components:{

  },
  data () {
    return {
      tableData: [],
      form1:{
        phone:''
      },
      form2: {
        phone:'',
        real_name:'',
        id:'',
        province:'',
        city:'',
        district:'',
        province_id:'',
        city_id:'',
        district_id:''
      },
      dialogVisible:false,
      page:1,
      pageSize:20,
      total:1,
      provinceOptions:[],
      cityOptions:[],
      areaOptions:[],
      loading:false,
      editIsShow:'',
      resetIsShow:''
    }
  },
  mounted(){
    this.init({});
    this.getStorage();
  },
  methods:{
    handleSizeChange(val) {
      this.pageSize = val;
      this.init(this.form1);
    },
    handleCurrentChange(val) {
      this.page = val;
      this.init({});
    },
    onSubmit(){
      this.init(this.form1)
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    init(params){
      var that = this;
      that.loading=true;
      params['token']=window.sessionStorage.getItem("token");
      params['page']=that.page;
      params['pageSize']=that.pageSize;
      axios.post(process.env.API_ROOT+'/user/index', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          if(res.data.data.list){
            var list = res.data.data.list;
            that.tableData = list;
            that.page = res.data.data.pager.page;
            that.total = Number(res.data.data.pager.Counts);
          }else{
            that.tableData = [];
            that.page = 1;
            that.pageCount = 1;
          }
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
        that.loading=false;
      })
      .catch(function(err){
        that.loading=false;
      });
    },
    edit(item){
      this.dialogVisible = true;
      this.form2.phone = item.row.phone;
      this.form2.real_name = item.row.real_name;
      this.form2.id = item.row.id;
      this.getProvince();
    },
    reset(item){
      var id = item.row.id;
      var that = this,params = {};
      params['token']=window.sessionStorage.getItem("token");
      params['id']=id;
      that.$confirm('是否确定要重置这个会员的认证信息？如选择重置，系统会删除用户的认证信息和绑定银行卡信息，但对用户已经提现的操作无任何影响', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.post(process.env.API_ROOT+'/user/authdel', qs.stringify(params),{
          headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(function(res){
          var status=res.data.status;
          if(status==0){
            that.init({})
            that.$message({
              showClose: true,
              message: '重置成功',
              type: 'success'
            });
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
      }).catch(() => {

      });

    },
    uplocBtn(){
      var params = this.form2,that = this;
      params['token']=window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/user/uploc', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
          that.init({})
          that.dialogVisible = false
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
    getProvince(){
      var that = this,params = {};
      params['token'] = window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/user/provinces', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.provinceOptions = res.data.data;
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
    getProvinceId(){
      var provinceStr = this.form2.province;
      var province = provinceStr.split("*")[0];
      var province_id = provinceStr.split("*")[1];
      this.getCity(province_id)
      this.form2.city = '';
      this.form2.province = province;
      this.form2.province_id = province_id;
      this.form2.district = '';
    },
    getCity(provinceid){
      var that = this,params = {};
      params['provinceid'] = provinceid;
      params['token'] = window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/user/city', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.cityOptions = res.data.data;
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
    getCityId(){
      var cityStr = this.form2.city;
      var city = cityStr.split("*")[0];
      var city_id = cityStr.split("*")[1];
      this.getArea(city_id);
      this.form2.city = city;
      this.form2.city_id = city_id;
      this.form2.district = '';
    },
    getArea(cityid){
      var that = this,params = {};
      params['cityid'] = cityid;
      params['token'] = window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/user/area', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.areaOptions = res.data.data;
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
    getAreaId(){
      var areaStr = this.form2.district;
      var district = areaStr.split("*")[0];
      var district_id = areaStr.split("*")[1];
      this.form2.district = district;
      this.form2.district_id = district_id;
    },
    getStorage(){
      var rules = window.sessionStorage.getItem("rules");
      if(rules == '*'){
        this.editIsShow = true;
        this.resetIsShow = true;
        return;
      }
      var menuList = JSON.parse(window.sessionStorage.getItem("menuList"));
      for(var i = 0;i < menuList.length;i++){
        if(rules.indexOf(menuList[i]['id'])!=-1){
          if(menuList[i]['action_id']=='user/uploc'){
            if(menuList[i]['show_button']==1){
              this.editIsShow = true;
            }else{
              this.editIsShow = false;
            }
          }
          if(menuList[i]['action_id']=='user/authdel'){
            if(menuList[i]['show_button']==1){
              this.resetIsShow = true;
            }else{
              this.resetIsShow = false;
            }
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
</style>
