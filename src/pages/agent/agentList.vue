<template>
  <div class="agentList-page">
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="会员手机号">
          <el-input v-model="form.phone" placeholder="请输入会员手机号" @keyup.enter.native="onSubmit"></el-input>
        </el-form-item>
        <el-form-item label="代理商级别">
          <el-select v-model="form.agentLevel" >
            <el-option label="全部" value=""></el-option>
            <el-option label="区代" value="1"></el-option>
            <el-option label="市代" value="2"></el-option>
            <el-option label="省代" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" >
            <el-option label="全部" value=""></el-option>
            <el-option label="正常" value="0"></el-option>
            <el-option label="锁定" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
          <el-button type="primary" size="small" class="create" @click="create" v-if="addIsShow">新建代理商</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        highlight-current-row
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="id" label="序号" width='50'> </el-table-column>
        <el-table-column prop="nickName" label="会员昵称"> </el-table-column>
        <el-table-column prop="phone" label="会员手机号"> </el-table-column>
        <el-table-column prop="agentLevel" label="代理级别" :formatter='formatAgentLevel'> </el-table-column>
        <el-table-column label="代理地区">
          <template slot-scope="scope">
            <div>{{scope.row.province}} <span v-if="scope.row.city">-</span> {{scope.row.city}} <span v-if="scope.row.area">-</span> {{scope.row.area}}</div>
          </template>
        </el-table-column>
        <el-table-column label="成为代理时间">
          <template slot-scope="scope">{{new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="变更时间">
          <template slot-scope="scope">{{scope.row.updateTime==0?"暂无更新时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" :formatter="formatStatus"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column label="操作" width="150" show-overflow-tooltip>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)' v-if="editIsShow">编辑</el-button>
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
        :page-sizes="[10, 20, 30, 40]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    <!-- 新建代理商 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="editRule" :model="editForm" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" @blur='getName' :disabled="editId>0"></el-input>
        </el-form-item>
        <el-form-item label="会员昵称" prop="nickName">
          <el-input v-model="editForm.nickName"  disabled></el-input>
        </el-form-item>
        <el-form-item label="代理级别" prop="agentLevel">
          <el-select v-model="editForm.agentLevel">
            <el-option label="区代" value="1"></el-option>
            <el-option label="市代" value="2"></el-option>
            <el-option label="省代" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="代理地区" prop="provinceObj">
          <div
            class="select-ul"
            :class="{
              'agent-p':editForm.agentLevel==3,
              'agent-c':editForm.agentLevel==2,
              'agent-a':editForm.agentLevel==1,
              'default':editForm.agentLevel=='',
            }"
          >
            <div class="select-li">
              <el-select v-model="editForm.provinceObj" value-key="provinceid" @change='provinceChange'>
                <el-option v-for="item in provinceList" :key="item.provinceid" :label="item.province" :value="item">
                </el-option>
              </el-select>
            </div>
            <div class="select-li">
              <el-select v-model="editForm.cityObj" value-key="cityid" @change='cityChange'>
                <el-option v-for="item in cityList" :key="item.cityid" :label="item.city" :value="item"></el-option>
              </el-select>
            </div>
            <div class="select-li">
              <el-select v-model="editForm.areaObj" value-key="areaid">
                <el-option v-for="item in areaList" :key="item.areaid" :label="item.area" :value="item"></el-option>
              </el-select>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="代理状态" prop="status">
          <el-select v-model="editForm.status">
            <el-option label="正常" value="0"></el-option>
            <el-option label="锁定" value="1"></el-option>
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
  import tool from '@/vendor/tool'
export default {
  name: 'agentList',
  data () {
    return {
      tableData: [],
      form: {
        phone:"",
        agentLevel:"",
        status:""
      },
      editId:null,
      editTitle:'',
      editForm: {
        phone:"",
        nickName:"",
        agentLevel:"",
        status:"",
        province:"",
        provinceId:"",
        city:"",
        cityId:"",
        area:"",
        areaId:"",
        provinceObj:"",
        cityObj:"",
        areaObj:"",

      },
      editRule:{
        phone:[{required:true,message:'请输入手机号',trigger:'blur'}],
        agentLevel:[{required:true,message:'请选择代理级别',trigger:'blur'}],
        provinceObj:[{required:true,message:'请选择代理地区',trigger:'blur'}],
        status:[{status:true,message:'请选择代理状态',trigger:'blur'}],
      },
      provinceList:[],
      cityList:[],
      areaList:[],
      delItems:[],
      editVisible:false,
      pageIndex:1,
      total:1,
      pageSize:10,
      loading:false,
    }
  },
  computed:{
    editIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
    addIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
  },
  mounted(){
    this.getData();
    this.getProvinceList();
  },
  methods:{
    //状态显示转换
    formatStatus(row, column) {
      return row.status == 1 ? '锁定' : row.status == 0 ? '正常' : '未知';
    },
    //代理商级别
    formatAgentLevel(row, column) {
      return row.agentLevel == 1 ? '区代' : row.agentLevel == 2 ? '市代' : row.agentLevel == 3 ? '省代' : '未知';
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/agent/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        ...this.form
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
      this.$get('/backend/agent/deleteByIds',{
        ids:idsStr
      }).then(r=>{
        if(r.status==0){
          this.$message.success('删除成功');
          this.getData();
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //每页条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData();
    },
    //切换当前页
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData();
    },
    //根据手机号获取昵称
    getName(){
      if(!(/^1[34578]\d{9}$/.test(this.editForm.phone))){
        return;
      }
      this.$get('/backend/user/getNickName',{
        phone:this.editForm.phone
      }).then(r=>{
        if(r.status==0 && r.data){
          this.editForm.nickName=r.data;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //创建
    create(){
      this.editTitle='新建代理商';
      this.editId=null;
      this.editVisible=true;
    },
    //编辑
    edit(item){
      this.getCityList(item.row.provinceId);
      this.getAreaList(item.row.cityId);
      this.editTitle='编辑代理商';
      this.editId=item.row.id;
      this.editForm.phone=item.row.phone;
      this.editForm.nickName=item.row.nickName;
      this.editForm.status=item.row.status+'';
      this.editForm.agentLevel=item.row.agentLevel+'';
      this.editForm.provinceObj={};
      this.editForm.provinceObj['province']=item.row.province;
      this.editForm.provinceObj['provinceid']=item.row.provinceId;
      this.editForm.cityObj={};
      this.editForm.cityObj['city']=item.row.city;
      this.editForm.cityObj['cityid']=item.row.cityId;
      this.editForm.areaObj={};
      this.editForm.areaObj['area']=item.row.area;
      this.editForm.areaObj['areaid']=item.row.areaId;
      this.editVisible=true;
    },
    handleClose(done) {
      this.$confirm('确认关闭？').then(_ => {
        this.editVisible=false;
        this.resetForm();
      }).catch(_ => {});
    },
    //清空表单
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editForm.phone='';
      this.editForm.nickName='';
      this.editForm.status='';
      this.editForm.agentLevel='';
      this.editForm.provinceObj='';
      this.editForm.cityObj='';
      this.editForm.areaObj='';
    },
    //提交编辑表单
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          var params={};
          params['phone']=this.editForm.phone;
          params['nickName']=this.editForm.nickName;
          params['status']=this.editForm.status;
          params['agentLevel']=this.editForm.agentLevel;
          params['province']=this.editForm.provinceObj.province;
          params['provinceId']=this.editForm.provinceObj.provinceid;
          params['city']=this.editForm.cityObj.city;
          params['cityId']=this.editForm.cityObj.cityid;
          params['area']=this.editForm.areaObj.area;
          params['areaId']=this.editForm.areaObj.areaid;
          if(this.editForm.agentLevel==2){
            params['area']='';
            params['areaId']='';
          }
          if(this.editForm.agentLevel==3){
            params['area']='';
            params['areaId']='';
            params['city']='';
            params['cityId']='';
          }
          if(this.editId){
            params['id']=this.editId;
          }
          this.$post('/backend/agent/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              if(this.editId){
                this.$message.success('编辑成功');
              }else{
                this.$message.success('添加成功');
              }
              this.getData();
              this.resetForm();
              this.editVisible=false;
            }else{
              this.$message.error(r.message);
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    //获取省
    getProvinceList(){
      this.$get('/backend/user/provinceList').then(r=>{
        if(r.status==0){
          this.provinceList=r.data;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //根据省的id获取市
    getCityList(provinceid){
      this.$get('/backend/user/cityList',{
        provinceid:provinceid
      }).then(r=>{
        if(r.status==0){
          this.cityList=r.data;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //根据市的id获取区或县
    getAreaList(cityid){
      this.$get('/backend/user/areaList',{
        cityid:cityid
      }).then(r=>{
        if(r.status==0){
          this.areaList=r.data;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //省改变则清空市县
    provinceChange(){
      this.getCityList(this.editForm.provinceObj.provinceid);
      this.editForm.cityObj='';
      this.editForm.areaObj='';
    },
    //市改变清空县
    cityChange(){
      this.getAreaList(this.editForm.cityObj.cityid);
      this.editForm.areaObj='';
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.agentList-page{
  .select-ul{
    overflow: hidden;
    &.agent-a{
      .select-li{
        float: left;
        width: 32%;
        margin-right:2%;
        &:last-child{
          margin-right:0px;
        }
      }
    }
    &.agent-c{
      .select-li{
        float: left;
        width: 49%;
        &:first-child{
          margin-right:2%;
        }
        &:last-child{
          display: none;
        }
      }
    }
    &.default,
    &.agent-p{
      .select-li{
        &:nth-child(2),
        &:last-child{
          display: none;
        }
      }
    }
  }
}
</style>
