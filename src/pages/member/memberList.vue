<template>
  <div>
    <div class="search" style="padding-bottom: 0">
      <el-form ref="lookupForm" :model="filterForm" :inline="true" class="demo-form-inline">
        <el-form-item label="昵称">
          <el-input v-model="filterForm.nickName" placeholder="请输入会员昵称" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="会员手机号">
          <el-input v-model="filterForm.phone" placeholder="请输入会员手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="推荐人手机号">
          <el-input v-model="filterForm.referreruserPhone" placeholder="请输入推荐人手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="会员级别" >
          <el-select v-model="filterForm.level" @change="getData">
            <el-option v-for="item in levelOption" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="filterForm.status" @change="getData">
            <el-option label="全部" value=""> </el-option>
            <el-option label="正常" value="0"> </el-option>
            <el-option label="冻结" value="1"> </el-option>
            <el-option label="锁定" value="2"> </el-option>
          </el-select>
        </el-form-item>
        <!--<el-form-item label="认证状态" @change="getData">
          <el-select v-model="filterForm.authStatus">
            <el-option v-for="item in authOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>-->
        <el-form-item>
          <el-button type="primary" size="small" @click='getData'>查询</el-button>
          <el-button type="primary" size="small" @click='export2Excel'>导出</el-button>
          <el-button type="primary" size="small" @click='create' v-if="addIsShow">新建</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        v-loading="loading"
        tooltip-effect="dark"
        highlight-current-row
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="nickName" width="120" label="昵称"></el-table-column>
        <el-table-column prop="inviteCode" width="150" label="邀请码"></el-table-column>
        <el-table-column prop="phone" width="110" label="会员手机号"> </el-table-column>
        <el-table-column prop="level" width="100" label="会员级别" :formatter='formatLevel'> </el-table-column>
        <el-table-column prop="referreruserName" width="120" label="推荐人姓名"></el-table-column>
        <el-table-column prop="referreruserPhone" width="120" label="推荐人电话"></el-table-column>
        <el-table-column prop="referreruserLever" width="120" label="推荐人级别"></el-table-column>
        <el-table-column label="注册时间">
          <template slot-scope="scope">{{!scope.row.createTime?"":new Date(scope.row.createTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="变更时间">
          <template slot-scope="scope">{{!scope.row.updatetime?"无更新时间":new Date(scope.row.updatetime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="status" width="80" label="账户状态" :formatter="formatStatus"> </el-table-column>
        <el-table-column prop="vipOnlineTime" width="80" label="累计在线时长"> </el-table-column>
        <el-table-column prop='vipExpiryTime' label="剩余有效期"></el-table-column>
        <el-table-column label="会议权限">
          <template slot-scope="item">
            <el-button size="mini" @click="$router.push({path:'/svip',query:{id:item.row.userAuthId}})">
              查看
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width='190' show-overflow-tooltip>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click="memberEdit(item)" v-if="editIsShow">编辑</el-button>
            <el-button size="mini" type="warning" @click="referrerEdit(item)" v-if="reviseIsShow">修改推荐人</el-button>
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
        :total="total">
      </el-pagination>
    </div>
    <el-dialog :visible.sync="showAddForm"  width="30%" :before-close="closeAddForm">
      <el-form ref="addForm" :model="addForm" :rules="addRule" label-width="100px">
        <el-form-item label="会员昵称">
          <el-input v-model="addForm.nickName" placeholder="请输入会员昵称"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model.number="addForm.phone" placeholder='请输入手机号' :disabled="editId>0"></el-input>
        </el-form-item>
        <el-form-item label="推荐人手机号" v-if="!editId"  prop="referreruserPhone">
          <el-input v-model.number="addForm.referreruserPhone" @blur='getReferrer(0)' placeholder='请输入推荐人手机号'></el-input>
        </el-form-item>
        <el-form-item label="推荐人昵称" v-if="!editId && addForm.referreruserName">
          <el-input v-model="addForm.referreruserName" placeholder='推荐人昵称' disabled></el-input>
        </el-form-item>
        <el-form-item label="会员级别">
          <el-select v-model="addForm.level">
            <el-option
              v-for="(item,index) in levelOption"
              :key="index"
              v-if="item.value!==''"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="addForm.status">
            <el-option v-for="(item,index) in memberStatus" :key="index" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" v-if="editId>0" prop="updateRemark">
          <el-input v-model="addForm.updateRemark" placeholder='备注' type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeAddForm">取 消</el-button>
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户资料 -->
    <!--<el-dialog title="编辑用户资料" :visible.sync="dialogVisible2" width="30%" :before-close="handleClose">
      <el-form ref="form2" :model="form2" label-width="80px">
        <el-form-item label="会员昵称">
          <el-input v-model="form2.name" placeholder="请输入会员昵称"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form2.phone" placeholder='请输入手机号' disabled></el-input>
        </el-form-item>
        <el-form-item label="会员级别">
          <el-select v-model="form2.level">
            <el-option v-for="item in levelOption" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="form2.status">
            <el-option label="正常" value="0"></el-option>
            <el-option label="冻结" value="1"></el-option>
            <el-option label="锁定" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="form2.updateRemark" placeholder='请输入备注（必填）'></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="form2Btn">确 定</el-button>
      </span>
    </el-dialog>-->
    <!-- 修改推荐人 -->
    <el-dialog title="修改推荐人" :visible.sync="showEditReferrer" width="30%" :before-close="closeEditReferrer">
      <el-form ref="referrerForm" :rules="referrerRule" :model="referrerForm" label-width="120px">
        <el-form-item label="原推荐人手机号">
          <el-input v-model="referrerForm.referreruserPhone" disabled placeholder="请输入原推荐人手机号"></el-input>
        </el-form-item>
        <el-form-item label="原推荐人昵称">
          <el-input v-model="referrerForm.referreruserName" disabled placeholder='请输入原推荐人昵称'></el-input>
        </el-form-item>
        <el-form-item label="新推荐人手机号" prop="newReferreruserPhone">
          <el-input v-model.number="referrerForm.newReferreruserPhone" placeholder="请输入新推荐人手机号" @blur='getReferrer(1)'></el-input>
        </el-form-item>
        <el-form-item label="新推荐人昵称" v-if="referrerForm.newReferreruserName">
          <el-input v-model="referrerForm.newReferreruserName" placeholder='请输入新推荐人昵称' disabled></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="updateRemark">
          <el-input type="textarea" v-model="referrerForm.updateRemark" placeholder='请输入备注（必填）'></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeEditReferrer">取 消</el-button>
        <el-button type="primary" @click="submitReferrerForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import  {idCardArea}  from '../../../config/id_card_area'
  import tool from '@/vendor/tool'
  var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
export default {
  data () {
    var validatePhone=(rule,value,callback)=>{
      if(value!='' && !/^1[3456789]\d{9}$/g.test(value) && value!='88888888888'){
        callback(new Error('手机号格式不正确'))
      }else{
        callback();
      }
    };
    var validateRemark=(rule,value,callback)=>{
      if(value.trim()=='' && this.editId>0){
        callback(new Error('请输入备注'))
      }else{
        callback();
      }
    };
    return {
      filterForm:{
        nickName:'',
        phone:'',
        level:'',
        status:'',
        referreruserPhone:'',
        authStatus:''
      },
      levelOption: [
        {value: '',label: '全部'},
        {value: 0, label: '普通会员'},
        {value: 1, label: 'VIP'},
        {value: 2, label: '弟子合伙人'},
        {value: 3, label: '创业'},
        {value: 4, label: '院长'},
        {value: 5, label: '未知'}
      ],
      memberStatus: [
        {value: 0, label: '正常'},
        {value: 1, label: '冻结'},
        {value: 2, label: '锁定'},
      ],
      authOptions: [
        {value: '', label: '全部'},
        {value: '0', label: '未认证'},
        {value: '1', label: '已认证'}
      ],
      tableData: [],
      delItems:[],
      editId:null,
      addForm:{
        nickName:'',
        phone:'',
        referreruserPhone:'',
        referreruserName:'',
        level:0,
        status:0,
        updateRemark:''
      },
      showAddForm:false,
      pageIndex:1,
      pageSize:10,
      total:1,
      loading:false,
      addRule:{
        phone:[
          {required:true,message:'请输入手机号',trigger:'blur'},
          {validator:validatePhone, trigger:'blur'}
        ],
        referreruserPhone:[{validator:validatePhone, trigger:'blur'}],
        updateRemark:[{validator:validateRemark, trigger:'blur'}]
      },
      showEditReferrer:false,
      referrerForm:{
        id:'',
        referreruserPhone:'',
        referreruserName:'',
        newReferreruserPhone:'',
        newReferreruserName:'',
        updateRemark:''
      },
      referrerRule:{
        /*newReferreruserPhone:[
          {required:true, message:'请输入推荐人手机号', trigger:'blur'},
          {validator:validatePhone, trigger:'blur'}
        ],*/
        updateRemark:[{required:true,message:'请输入修改原因', trigger:'blur'}]
      },
    }
  },
  computed:{
    editIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
    addIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
    reviseIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
  },
  mounted:function(){
    this.getData();
  },
  methods:{
    //获取列表
    getData(){
      this.loading=true;
      this.$get('/backend/user/list',{
        ...this.filterForm,
        startPage:this.pageIndex,
        pageSize:this.pageSize,
      }).then(r=>{
        if(r.status==0){
          this.total=r.total;
          this.tableData=r.data;
        }
        this.loading=false;
      }).catch(err=>{
        this.$message.error(err.message);
        this.loading=false;
      })
    },
    //获取选中的表格信息
    handleSelectionChange(data){
      this.delItems=data;
    },
    //选择删除
    mulDelete(){
      let ids=[];
      let uids=[]
      for(let i=0;i<this.delItems.length;i++){
        ids.push(this.delItems[i].id);
        uids.push(this.delItems[i].userAuthId)
      }
      var idsStr=ids.join(',');
      var uidsStr=uids.join(',');
      this.$get('/backend/user/deleteByIds',{
        ids:idsStr,
        uids:uidsStr,
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
    //每页显示条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData();
    },
    //切换当前页
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData();
    },
    //新建
    create(){
      this.editId=null;
      this.showAddForm=true;
    },
    //会员编辑
    memberEdit(data){
      this.editId=data.row.id;
      this.addForm.nickName=data.row.nickName;
      this.addForm.phone=data.row.phone;
      this.addForm.referreruserPhone=data.row.referreruserPhone;
      this.addForm.referreruserName=data.row.referreruserName;
      this.addForm.level=data.row.level;
      this.addForm.status=data.row.status;
      this.addForm.updateRemark=data.row.updateRemark;
      this.showAddForm=true;
    },
    //关闭新增/编辑弹框
    closeAddForm(){
      this.$confirm('确认关闭？').then(()=> {
        this.resetAddForm();
        this.showAddForm=false;
      }).catch(() => {});
    },
    //清空编辑框
    resetAddForm(){
      this.$refs['addForm'].resetFields();
      this.addForm.nickName='';
      this.addForm.phone='';
      this.addForm.referreruserPhone='';
      this.addForm.referreruserName='';
      this.addForm.level=0;
      this.addForm.status=0;
      this.addForm.updateRemark='';
    },
    //提交新增或编辑
    submitAddForm(){
      this.$refs['addForm'].validate(valid=>{
        if(valid){
          var params={};
          params['nickName']=this.addForm.nickName==''?this.addForm.phone:this.addForm.nickName;
          params['phone']=this.addForm.phone;
          params['referreruserPhone']=this.addForm.referreruserPhone;
          params['referreruserName']=this.addForm.referreruserName;
          params['level']=this.addForm.level;
          params['status']=this.addForm.status;
          if(this.editId>0){
            params['id']=this.editId;
            params['updateRemark']=this.addForm.updateRemark;
          }
          this.$post('/backend/user/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              if(this.editId>0){
                this.$message.success('编辑成功');
                this.showAddForm=false;
              }else{
                this.$message.success('添加成功');
                this.showAddForm=false;
              }
              this.getData();
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    //根据手机号查询推荐人
    getReferrer(data){
      var phone=''
      if(data==1){
        phone=this.referrerForm.newReferreruserPhone;
      }else{
        phone=this.addForm.referreruserPhone;
      }
      if(phone==''){
        phone='88888888888'
      }
      this.$get('/backend/user/getReferreruserName',{
        referreruserPhone:phone
      }).then(r=>{
        if(r.status==0){
          if(data==1){
            this.referrerForm.newReferreruserName=r.data;
          }else{
            this.addForm.referreruserName=r.data;
          }
        }else{
          if(data==1){
            this.referrerForm.newReferreruserName='';
          }else{
            this.addForm.referreruserName='';
          }
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //修改推荐人
    referrerEdit(data){
      this.referrerForm.id=data.row.id;
      this.referrerForm.referreruserPhone=data.row.referreruserPhone;
      this.referrerForm.referreruserName=data.row.referreruserName;
      this.showEditReferrer=true;
    },
    //关闭修改推荐人
    closeEditReferrer(){
      this.$confirm('确认关闭？').then(()=> {
        this.resetReferrerForm();
        this.showEditReferrer=false;
      }).catch(() => {});
    },
    resetReferrerForm(){
      this.$refs['referrerForm'].resetFields();
      this.referrerForm.id='';
      this.referrerForm.referreruserPhone='';
      this.referrerForm.referreruserName='';
      this.referrerForm.newReferreruserPhone='';
      this.referrerForm.newReferreruserName='';
      this.referrerForm.updateRemark='';
    },
    //提交修改推荐人信息
    submitReferrerForm(){
      this.$refs['referrerForm'].validate(valid=>{
        if(valid){
          this.$post('/backend/user/insertOrUpdate',{
            ...this.referrerForm
          }).then(r=>{
            this.$message.success('修改成功');
            this.getData();
            this.showEditReferrer=false;
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    //导出表格
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['昵称', '邀请码', '会员手机号', '会员级别', '推荐人姓名','推荐人手机号',"推荐人级别","注册时间","变更时间","账户状态","累计在线时长","剩余有效期"];
        const filterVal = ['nickName', 'inviteCode', 'phone', 'level', 'referreruserName' ,'referreruserPhone','referreruserLevel','createTime','updatetime','status','vipOnlineTime','vipExpiryTime'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][3] = data[i][3]==0 ? '普通会员' : data[i][3] == 1 ? 'VIP':data[i][3] == 2 ? '弟子合伙人'  : data[i][3] == 3 ? '创业':data[i][3] == 4 ? '院长' : '未知';//会员级别
//          data[i][6] = data[i][6]==0?"未认证":"已认证";//
          data[i][7] = !data[i][7]?"0":tool.timeFormat(data[i][7])//注册时间
          data[i][8] = !data[i][8]?"0":tool.timeFormat(data[i][8])//变更时间
          data[i][9] = data[i][9]==0?"正常":data[i][9]==1?"冻结":"锁定";//账户状态
        }
        export_json_to_excel(tHeader, data, '会员列表excel');
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },

    //账户状态转换
    formatStatus: function (row, column) {
      return row.status == 0 ? '正常' : row.status == 1 ? '冻结':row.status == 2 ? '锁定' : '未知';
    },//会员等级
    formatLevel: function (row, column) {
      return row.level == 0 ? '普通会员' : row.level == 1 ? 'VIP':row.level == 2 ? '弟子合伙人'  : row.level == 3 ? '创业':row.level == 4 ? '院长' : '未知';
    },//认证状态
    formatAuthStatus: function (row, column) {
      return row.auth_status == 0 ? '未认证' : row.auth_status == 1 ? '已认证' : '未知';
    },

    /*getIDCard2(e){
      if(e.length>=6){
        var data = this.getAreaByIdCard(e);
        var id = data.split("*")[0];
        var address = data.split("*")[1];
        var province_id = id.split("/")[0];
        var city_id = id.split("/")[1];
        var area_id = id.split("/")[2];
        var province = address.split("/")[0];
        var city = address.split("/")[1];
        var area = address.split("/")[2];
        this.form2.province_id = province_id;
        this.form2.city_id = city_id;
        this.form2.district_id = area_id;
        this.form2.province = province;
        this.form2.district = area;
        this.form2.city = city;
      }
    },
    getIDCard(e){
      if(e.length>=6){
        var data = this.getAreaByIdCard(e);
        var id = data.split("*")[0];
        var address = data.split("*")[1];
        var province_id = id.split("/")[0];
        var city_id = id.split("/")[1];
        var area_id = id.split("/")[2];
        var province = address.split("/")[0];
        var city = address.split("/")[1];
        var area = address.split("/")[2];
        this.addForm.province_id = province_id;
        this.addForm.city_id = city_id;
        this.addForm.district_id = area_id;
        this.addForm.province = province;
        this.addForm.district = area;
        this.addForm.city = city;
      }
    },
    getAreaByIdCard : function(idCard) {
      var data = idCardArea();
      if(!idCard || idCard.length < 6) return '';
      var provinceNo = idCard.substring(0, 2) + '0000';
      var cityNo = idCard.substring(0, 4) + '00';
      var countyNo = idCard.substring(0, 6);
      var provinceName = data.province[provinceNo];
      var cityName = data.city[cityNo];
      var countyName = data.county[countyNo];
      var id = provinceNo+"/"+cityNo+"/"+countyNo;
      var result = id+"*"+(provinceName ? provinceName : '')  + '/' + (cityName ? cityName : '') + '/' + (countyName ? countyName : '');
      return result;
    },
    select(e){
      var len = e.length;
      if(len){
        this.delAll = true
      }else{
        this.delAll = false
      }
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
      params['page']=that.pageIndex;
      params['pageSize']=that.pageSize;
      axios.post(process.env.API_ROOT+'/user/index', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        var curTime = Date.parse(new Date())/1000;
        if(status==0){
          var list = res.data.data.list;
          if(list){
            for(var i = 0;i<list.length;i++){
              if(list[i]['vip_expiry_time']!=0){
                list[i]['vip_expiry_time'] = 365-Math.ceil((curTime - list[i]['vip_expiry_time'])/86400)+"天"
              }
            }
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
    userEdit(item){
      this.dialogVisible=true;
      this.form2.id=item.row.id;
      this.form2.name=item.row.nick_name;
      this.form2.phone = item.row.phone;
      this.form2.level=item.row.level;
      this.form2.status=item.row.status;
      this.form2.updateRemark= item.row.update_remark;
      this.form2.province= item.row.province;
      this.form2.province_id= item.row.province_id;
      this.form2.district= item.row.district;
      this.form2.district_id= item.row.district_id;
      this.form2.city= item.row.city;
      this.form2.city_id= item.row.city_id;
      this.form2.updateRemark= item.row.update_remark;
      if(certificate){
        this.getIDCard2(certificate)
      }
    },
    form2Btn(){
      var that = this;
      var params = this.form2;
        params['token'] = window.sessionStorage.getItem("token")

      axios.post(process.env.API_ROOT+'/user/update', qs.stringify(params),{
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
          that.dialogVisible2 = false;
          that.init({});
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
    lookup(){
      var params = this.lookupForm;
      this.init(params)
    },
    form3Btn(){
      var params = this.form3,that = this;
      params['token']=window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/user/updateT', qs.stringify(params),{
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
          that.dialogVisible3 = false;
          that.init({});
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
      })
      .catch(function(err){
        that.loading=false;
      });
    },
    addBtn(){
      var params = this.addForm,that = this;
      params['token'] = window.sessionStorage.getItem("token");
      if(!/^[1][3,4,5,7,8][0-9]{9}$/.test(params['phone'])){
        that.$message({
          showClose: true,
          message: '请输入正确手机号',
          type: 'warning'
        });
        return;
      }
      var level_name;
      switch(params['level'])
      {
      case '0':
        level_name = '普通会员';
        break;
      case '1':
        level_name = 'VIP';
        break;
      case '2':
        level_name = '弟子合伙人';
        break;
      case '3':
        level_name = '创业';
        break;
      case '4':
        level_name = '院长';
        break;
      default:
        level_name = ''
      }
      params['level_name'] = level_name;
      axios.post(process.env.API_ROOT+'/user/adduser', qs.stringify(params),{
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
          that.dialogVisible = false;
          that.init({});
          that.addForm.phone = "";
          that.addForm.nick_name = "";
          that.addForm.referreruser_phone = "";
          that.addForm.referreruser_nick_name = "";
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
    getPhone(){
      var that = this;
      if(that.addForm.referreruser_phone.length==11||that.form3.phone.length==11){
        var params = {};
        params['token'] = window.sessionStorage.getItem("token");
        params['phone'] = this.addForm.referreruser_phone||that.form3.phone;
        axios.post(process.env.API_ROOT+'/user/getbyphone', qs.stringify(params),{
          headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(function(res){
          var status=res.data.status;
          if(status==0){
            that.addForm.referreruser_nick_name = res.data.data.name;
            that.form3.name = res.data.data.name;
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
    getStorage(){
      var rules = window.sessionStorage.getItem("rules");
      if(rules == '*'){
        this.addIsShow = true;
        this.editIsShow = true;
        this.editIsShowT = true;
        return;
      }
      var menuList = JSON.parse(window.sessionStorage.getItem("menuList"));
      for(var i = 0;i < menuList.length;i++){
        if(rules.indexOf(menuList[i]['id'])!=-1){
          if(menuList[i]['action_id']=='user/adduser'){
            if(menuList[i]['show_button']==1){
              this.addIsShow = true;
            }else{
              this.addIsShow = false;
            }
          }
          if(menuList[i]['action_id']=='user/update'){
            if(menuList[i]['show_button']==1){
              this.editIsShow = true;
            }else{
              this.editIsShow = false;
            }
          }
          if(menuList[i]['action_id']=='user/updatet'){
            if(menuList[i]['show_button']==1){
              this.editIsShowT = true;
            }else{
              this.editIsShowT = false;
            }
          }
        }
      }
    },
    getAddress(e){
      var that = this;
      if(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(e)){
        var params = {};
          params['phone'] = e;
          params['token'] = window.sessionStorage.getItem("token");
        axios.post(process.env.API_ROOT+'/user/GetGeoByPhone', qs.stringify(params),{
          headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(function(res){
          var status=res.data.status;
          if(status == 0){
            var data = res.data.data
            that.addForm.province = data.province;
            that.addForm.province_id = data.provinceid;
            that.addForm.city = data.city;
            that.addForm.city_id = data.city_id;
          }
        })
        .catch(function(err){

        });
      }
    },*/
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

