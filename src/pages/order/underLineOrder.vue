<template>
  <div class="offlineOrder-page">
    <div class="search">
      <el-form ref="form" :model="form" :inline="true" class="demo-form-inline">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="报名会议">
          <el-input v-model="form.enrollMeetingName" placeholder="请输入报名会议" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="成交会议">
          <el-input v-model="form.dealMeetingName" placeholder="请输入成交会议" @keyup.enter.native="getData"></el-input>
        </el-form-item>
       <!--<el-form-item label="支付状态">
          <el-select v-model="form.payStatus" >
            <el-option label="全部" value=""></el-option>
            <el-option label="未支付" value="0"></el-option>
            <el-option label="已支付" value="1"></el-option>
            <el-option label="已取消" value="2"></el-option>
          </el-select>
        </el-form-item>-->
        <el-form-item label="分润状态">
          <el-select v-model="form.isShare"  @change="getData">
            <el-option label="全部" value=""></el-option>
            <el-option label="未分润" value="0"></el-option>
            <el-option label="已分润" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click='getData'>查询</el-button>
          <el-button type="primary" size="small" @click='export2Excel'>导出</el-button>
          <el-button type="primary" size="small" class='create' @click="create" v-if="addIsShow">新建</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        v-loading='loading'
        tooltip-effect="dark"
        highlight-current-row
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column prop="id" label="#ID" width="60"></el-table-column>
        <el-table-column prop="orderNo" label="订单编号"></el-table-column>
        <el-table-column prop="userName" label="会员昵称"></el-table-column>
        <el-table-column prop="phone" label="会员手机号"></el-table-column>
        <el-table-column prop="enrollMeetingNumber" label="报名会议编号"></el-table-column>
        <el-table-column prop="enrollMeetingName" label="报名会议主题"></el-table-column>
        <el-table-column prop="meetingTypeName" label="报名会议分类"></el-table-column>
        <el-table-column prop="meetingConfigType" label="报名会议种类"></el-table-column>
        <el-table-column prop="meetingFengrunType" :formatter='formMeetingFengrunType' label="报名会议分润类型"> </el-table-column>
        <el-table-column prop="meetingConfigInfo.meetingLevel" :formatter='formMeetingLevel' label="报名会议所属权限"> </el-table-column>
        <el-table-column prop="dealMeetingNumber" label="成交会议编号"> </el-table-column>
        <el-table-column prop="dealMeetingName" label="成交会议主题"> </el-table-column>
        <el-table-column prop="name" label="报名时间">
          <template slot-scope="scope">{{new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="cost" label="报名费用"></el-table-column>
        <el-table-column prop="realCost" label="实际费用"></el-table-column>
        <el-table-column prop="type" :formatter='formatType' label="支付方式"></el-table-column>
        <el-table-column prop="isShare" :formatter='formIsShare' label="分润状态"></el-table-column>
        <el-table-column label="操作" width='148' show-overflow-tooltip>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)' v-if="editIsShow" >编辑</el-button>
            <el-button size="mini" type="danger" :disabled="item.row.isShare!=0"  @click='orderProfit(item)'>分润</el-button>
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
        :total="total"></el-pagination>
    </div>

    <el-dialog :title='editTitle' :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="110px" size="mini">
        <el-row>
          <el-col :span="20">
            <el-form-item label="会员手机号" prop="phone">
              <el-input v-model="editForm.phone" placeholder="请输入会员手机号"  @input='getName' :disabled="editId>0"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4"></el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="会员昵称">
              <el-input v-model="editForm.userName"  disabled='disabled' placeholder="请输入会员昵称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4"></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="报名会议编号" prop="enrollMeetingNumber">
              <el-input v-model="editForm.enrollMeetingNumber"  disabled='disabled' placeholder="请输入报名会议编号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button type='primary' size='mini' @click="enrollMeeting">选择</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="报名会议主题">
              <el-input v-model="editForm.enrollMeetingName" disabled='disabled' placeholder="请输入报名会议主题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4"></el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="报名会议分类">
              <el-input v-model="editForm.meetingTypeName" disabled='disabled' placeholder="请输入报名会议主题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4"></el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="分润类型">
              <!--<el-input v-model="editForm.meetingFengrunType"  disabled='disabled' placeholder="请输入分润类型"></el-input>-->
              <el-select v-model="editForm.meetingLevel"  disabled='disabled' placeholder="分润类型">
                <el-option label="" value=""> </el-option>
                <el-option label="正常分润会议" value="0"> </el-option>
                <el-option label="398特殊分润会议" value="1"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4"></el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="所属权限">
              <!--<el-input :value="getLevel(editForm.meetingLevel)" disabled='disabled' placeholder="所属权限"></el-input>-->
              <el-select v-model="editForm.meetingLevel"  disabled='disabled' placeholder="所属权限">
                <el-option label="" value=""> </el-option>
                <el-option label="无权限" value="0"> </el-option>
                <el-option label="一级" value="1"> </el-option>
                <el-option label="二级" value="2"> </el-option>
                <el-option label="三级" value="3"> </el-option>
                <el-option label="四级" value="4"> </el-option>
                <el-option label="五级" value="5"> </el-option>
                <el-option label="六级" value="6"> </el-option>
                <el-option label="七级" value="7"> </el-option>
                <el-option label="八级" value="8"> </el-option>
                <el-option label="九级" value="9"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4"></el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="费用">
              <el-input v-model="editForm.cost"  disabled='disabled' placeholder="请输入费用"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4"></el-col>
        </el-row>
        <hr>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="成交会议编号">
              <el-input v-model="editForm.dealMeetingNumber"  disabled='disabled' placeholder="请输入成交会议编号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button type='primary' size='mini' @click="dealMeeting">选择</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="成交会议主题">
              <el-input v-model="editForm.dealMeetingName"  disabled='disabled' placeholder="请输入成交会议主题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4"></el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="会议列表"
      :visible.sync="meetingVisible"
      custom-class="meeting-dialog"
      :before-close="closeMeeting"
    >
      <div class="scroller">
        <meeting-list  @getItem="getMeeting" :isComponent="true"></meeting-list>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeMeeting">取 消</el-button>
        <el-button type="primary" @click="ensure">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加选择会议1 -->
    <!--<el-dialog  title="新建会议列表1" :visible.sync="dialogVisible2" width="80%" :before-close="handleClose">
      <selectMeeting1  @ievent1="ievent1"></selectMeeting1>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2=false">取 消</el-button>
        <el-button type="primary" @click='makeSureMeetingBtn1()'>确 定</el-button>
      </span>
    </el-dialog>-->

    <!-- 添加选择会议2 -->
    <!--<el-dialog  title="新建会议列表2" :visible.sync="dialogVisible3" width="80%" :before-close="handleClose">
      <selectMeeting2  @ievent2="ievent2"></selectMeeting2>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible3=false">取 消</el-button>
        <el-button type="primary" @click='makeSureMeetingBtn2()'>确 定</el-button>
      </span>
    </el-dialog>-->

    <!-- 编辑选择会议1 -->
    <!--<el-dialog  title="新建会议列表3" :visible.sync="dialogVisible20" width="80%" :before-close="handleClose">
      <selectMeeting3  @ievent3="ievent3"></selectMeeting3>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible20=false">取 消</el-button>
        <el-button type="primary" @click='makeSureMeetingBtn3()'>确 定</el-button>
      </span>
    </el-dialog>-->

    <!-- 编辑选择会议2 -->
    <!--<el-dialog  title="新建会议列表4" :visible.sync="dialogVisible50" width="80%" :before-close="handleClose">
      <selectMeeting4  @ievent4="ievent4"></selectMeeting4>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible50=false">取 消</el-button>
        <el-button type="primary" @click='makeSureMeetingBtn4()'>确 定</el-button>
      </span>
    </el-dialog>-->

  </div>
</template>

<script>
  import uploader from '@/components/uploader'
  import meetingList from '@/pages/meeting/meetingList'
  import tool from '@/vendor/tool'
export default {
  name: 'lecturerList',
  components:{
    uploader,
    meetingList,
  },
  data () {
    return {
      tableData: [],
      orderTableData:[],
      form: {
        type:0, //线下
        phone: '',
        enrollMeetingName: '',
        dealMeetingName: '',
        //payStatus: '',
        isShare: '',
      },
      delItems:[],
      editVisible:false,
      meetingVisible:false,
      pageIndex:1,
      pageSize:10,
      total:0,
      editTitle:'',
      editId:null,
      editForm:{
        type:0,//线下订单
        phone:'',
        userName:'',
        enrollMeetingNumber:'',
        enrollMeetingName:'',
        meetingType:'',
        meetingFengrunType:'',
        meetingLevel:'',
        dealMeetingNumber:'',
        dealMeetingName:'',
        meetingId:'',
        dealMeetingId:'',
      },
      rules:{
        phone:[
          {required:true,message:'请输入用户手机号',trigger:'blur'},
        ],
        enrollMeetingNumber:[{required:true,message:'请选择报名会议',trigger:'blur'}]
      },
      loading:false,
      isDeal:false,//弹出的会议弹框是否是成交会议
      meetingInfo:'',//选中的报名会议信息
      dealMeetingInfo:'',//选中的成交会议信息

      /*MeetingTypeList:[],
      meetingInfo:'',
      meetingInfo2:'',
      makeSureMeetingInfo:'',
      idx:'',
      meetingData1:[],
      meetingData2:[],
      meetingData3:[],
      meetingData4:[],*/
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
  },
  methods:{
    formatType(row, column) {
      return row.type == 1 ? '线上' : row.type == 0 ? '线下': '未知';
    },
    formMeetingFengrunType(row,column){
      return row.meetingFengrunType == 0 ? '正常分润会议' : row.meetingFengrunType == 1 ? '398特殊分润会议': '未知';
    },
    formMeetingLevel(row,column){
      return this.getLevel(row.meetingLevel);
    },
    formatStart: function (row, column) {
      return row.start == 1 ? '上架' : row.start == 0 ? '下架' : '未知';
    },
    formIsShare(row,column){
      return row.isShare == 0 ? '未分润' : row.isShare == 1 ? '已分润': '未知';
    },
    //权限等级
    getLevel(data){
      let str='';
      switch (data){
        case 0:
          str='无权限';
          break;
        case 1:
          str='一级';
          break;
        case 2:
          str='二级';
          break;
        case 3:
          str='三级';
          break;
        case 4:
          str='四级';
          break;
        case 5:
          str='五级';
          break;
        case 6:
          str='六级';
          break;
        case 7:
          str='七级';
          break;
        case 8:
          str='八级';
          break;
        case 9:
          str='九级';
          break;
      }
      return str;
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/order/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        ...this.form
      }).then(r=>{
        this.loading=false;
        if(r.status==0){
          let list=r.data
          for(var i=0;i<list.length;i++){
            list[i]['meetingTypeName']=list[i].meetingTypeInfo?list[i].meetingTypeInfo.typename:'';
            if(list[i].meetingConfig){
              if(list[i].meetingConfig.meetingRewardPlantLevel==0){
                list[i]['meetingConfigType']='正常会议';
              }else{
                list[i]['meetingConfigType']='升级会议';
              }
            }else{
              list[i]['meetingConfigType']='';
            }
          }
          this.tableData=list;
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
      this.$get('/backend/order/deleteByIds',{
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
    //创建
    create(){
      this.editId=null;
      this.editTitle='创建订单';
      this.editVisible=true;
    },
    //编辑
    edit(item){
      this.editTitle='编辑订单';
      this.editId=item.row.id;
      this.editForm.phone=item.row.phone;
      this.editForm.userName=item.row.userName;
      this.editForm.enrollMeetingNumber=item.row.enrollMeetingNumber;
      this.editForm.enrollMeetingName=item.row.enrollMeetingName;
      this.editForm.meetingTypeName=item.row.meetingTypeName;
      this.editForm.meetingType=item.row.meetingType;
      this.editForm.meetingFengrunType=item.row.meetingFengrunType+'';
      this.editForm.meetingLevel=item.row.meetingLevel+'';
      this.editForm.cost=item.row.cost;
      this.editForm.dealMeetingNumber=item.row.dealMeetingNumber;
      this.editForm.dealMeetingName=item.row.dealMeetingName;
      this.editForm.meetingId=item.row.meetingId;
      this.editForm.dealMeetingId=item.row.dealMeetingId;
      this.editVisible=true;
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
          this.editForm.userName=r.data;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //关闭弹框
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.editVisible=false;
          this.resetForm();
        })
        .catch(_ => {});
    },
    //清空表单
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editForm.phone='';
      this.editForm.userName='';
      this.editForm.enrollMeetingNumber='';
      this.editForm.enrollMeetingName='';
      this.editForm.meetingTypeName='';
      this.editForm.meetingType='';
      this.editForm.meetingFengrunType='';
      this.editForm.meetingLevel='';
      this.editForm.cost='';
      this.editForm.dealMeetingNumber='';
      this.editForm.dealMeetingName='';
      this.editForm.meetingId='';
      this.editForm.dealMeetingId='';
    },
    //提交编辑
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          let params={...this.editForm};
          if(this.editId){
            params['id']=this.editId;
          }
          this.$post('/backend/order/insertOrUpdate',params).then(r=>{
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
    //报名会议弹框
    enrollMeeting(){
      this.isDeal=false;
      this.meetingVisible=true;
    },
    //成交会议弹框
    dealMeeting(){
      this.isDeal=true;
      this.meetingVisible=true;
    },
    //选择会议信息
    getMeeting(data){
      if(this.isDeal){
        this.dealMeetingInfo=data;
      }else{
        this.meetingInfo=data;
      }
    },
    //关闭会议弹框
    closeMeeting(){
      this.meetingInfo='';
      this.dealMeetingInfo='';
      this.meetingVisible=false;
    },
    //确认选择会议
    ensure(){
      if(this.isDeal){
        let deal=this.dealMeetingInfo;
        this.editForm.dealMeetingNumber=deal.meetingNumber;
        this.editForm.dealMeetingName=deal.meetingtitle;
        this.editForm.dealMeetingId=deal.meetingid;
      }else{
        let enroll=this.meetingInfo;
        this.editForm.meetingId=enroll.meetingid;
        this.editForm.enrollMeetingNumber=enroll.meetingNumber;
        this.editForm.enrollMeetingName=enroll.meetingtitle;
        this.editForm.meetingTypeName=enroll.meetingTypeName;
        this.editForm.meetingType=enroll.meetingTypeId;
        this.editForm.meetingFengrunType=enroll.meetingFengrunType?enroll.meetingFengrunType+'':'0';
        this.editForm.meetingLevel=enroll.meetingConfig?enroll.meetingConfig.meetingLevel+'':'0';
        this.editForm.cost=enroll.cost;
      }
      this.closeMeeting();
    },
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['订单编号', '会员昵称', '会员手机号', '报名会议编号', '报名会议主题','报名会议种类',"报名会议分润类型","报名会议所属权限","报名时间","报名费用","实际费用","支付方式","分润"];
        const filterVal = ['orderNo', 'userName', 'phone', 'enrollMeetingNumber', 'enrollMeetingName' ,'meetingConfigType','meetingFengrunType','meetingLevel','addTime','cost','realCost','type','payStatus'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][6] = data[i][6]==0 ? '正常分润会议' : data[i][6] == 1 ? '398特殊分润会议': '未知';
          data[i][7] =this.getLevel(data[i][7]);
          data[i][8] = tool.timeFormat(data[i][8])//报名时间
          data[i][11] = data[i][11]==1 ? '线上' : data[i][11] == 0 ? '线下': '未知';
          data[i][12] = data[i][12]==0 ? '未分润' : data[i][12] == 1 ? '已分润': '未知';//分润状态
        }
        export_json_to_excel(tHeader, data, '线下订单excel');
      })
    },
    //分润
    orderProfit(item){
      var id = item.row.id,
        that = this,
        params = {
          token:window.sessionStorage.getItem("token"),
          id:id
        };
      this.$confirm('是否确定分润，选择确定，后续不可再撤销分润？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.post(process.env.API_ROOT+'/order/profit', qs.stringify(params),{
          headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .then(function(res){
            if(res.data.status==0){
              that.init(that.form)
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










    /*ievent1(data){
      this.meetingData1 = data;
      this.$message({
        showClose: true,
        message: '已选择会议',
        type: 'success'
      });
    },
    ievent2(data){
      this.meetingData2 = data;
      this.$message({
        showClose: true,
        message: '已选择会议',
        type: 'success'
      });
    },
    ievent3(data){
      this.meetingData3 = data;
      this.$message({
        showClose: true,
        message: '已选择会议',
        type: 'success'
      });
    },
    ievent4(data){
      this.meetingData4 = data;
      this.$message({
        showClose: true,
        message: '已选择会议',
        type: 'success'
      });
    },
    makeSureMeetingBtn1(){
      let data = this.meetingData1;
      this.addForm.meeting_id = data.meetingid;
      this.addForm.enroll_meeting_number = data.meeting_number;
      this.addForm.enroll_meeting_name = data.meetingtitle;
      this.addForm.meeting_type = data.meeting_type_info.meetingtypeid;
      this.addForm.typename = data.meeting_type_info.typename;
      this.addForm.meeting_fengrun_type = data.meeting_config_info.meeting_fengrun_type;
      this.addForm.cost = data.cost;
      this.addForm.meeting_level = data.meeting_config_info.meeting_level;
      this.dialogVisible2 = false;
    },
    makeSureMeetingBtn2(){
      let data = this.meetingData2;
      this.addForm.deal_meeting_id = data.meetingid;
      this.addForm.deal_meeting_number = data.meeting_number;
      this.addForm.deal_meeting_name = data.meetingtitle;
      this.dialogVisible3 = false;
    },
    makeSureMeetingBtn3(){
      let data = this.meetingData3;
      this.editForm.meeting_id = data.meetingid;
      this.editForm.enroll_meeting_number = data.meeting_number;
      this.editForm.enroll_meeting_name = data.meetingtitle;
      this.editForm.meeting_type = data.meeting_type_info.meetingtypeid;
      this.editForm.typename = data.meeting_type_info.typename;
      this.editForm.meeting_fengrun_type = data.meeting_config_info.meeting_fengrun_type;
      this.editForm.cost = data.cost;
      this.editForm.meeting_level = data.meeting_config_info.meeting_level;
      this.dialogVisible20 = false;
    },
    makeSureMeetingBtn4(){
      let data = this.meetingData4;
      this.editForm.deal_meeting_id = data.meetingid;
      this.editForm.deal_meeting_number = data.meeting_number;
      this.editForm.deal_meeting_name = data.meetingtitle;
      this.dialogVisible50 = false;
    },
    handleSelectionChange1(e){
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
    init(params){
      var that = this;
      params['token'] = window.sessionStorage.getItem("token")
      params['page'] = this.page;
      params['pageSize'] = this.pageSize;
      axios.post(process.env.API_ROOT+'/order/OrderList', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          if(res.data.data.list){
            that.tableData = res.data.data.list;
            that.total = Number(res.data.data.pager.Counts);
            that.page = res.data.data.pager.page;
          }
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
        that.loading = false;
      })
      .catch(function(err){

      });
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
            that.addForm.user_name = res.data.data.name;
            that.addForm.user_id = res.data.data.user_auth_id;
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
    addOrderBtn(){
      var params = this.addForm,that = this;
      params['token'] = window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/order/addorder', qs.stringify(params),{
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
            message: res.data.message,
            type: 'success'
          });
          that.init(that.form);
          that.cancelBtn();
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
    editOrder(item){
      this.dialogVisible40 = true;
      this.editForm.id = item.row.id;
      this.editForm.phone = item.row.phone;
      this.editForm.user_name = item.row.user_name;
      this.editForm.user_id = item.row.user_auth_id;
      this.editForm.meeting_id = item.row.meeting_id;
      this.editForm.enroll_meeting_number = item.row.enroll_meeting_number;
      this.editForm.enroll_meeting_name = item.row.enroll_meeting_name;
      this.editForm.meeting_type = item.row.meeting_type_info.meetingtypeid;
      this.editForm.typename = item.row.meeting_type_info.typename;
      this.editForm.meeting_fengrun_type = item.row.meeting_fengrun_type;
      this.editForm.cost = item.row.cost;
      this.editForm.meeting_level = item.row.meeting_level;
      this.editForm.deal_meeting_id = item.row.deal_meeting_id;
      this.editForm.deal_meeting_number = item.row.deal_meeting_number;
      this.editForm.deal_meeting_name = item.row.deal_meeting_name;
    },
    editOrderBtn(){
      var params = this.editForm,that = this;
      params['token'] = window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/order/updateOrder', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        if(status==0){
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
          that.init(that.form)
          that.dialogVisible40 = false;
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
    cancelBtn(){
      var that = this;
      that.dialogVisible = false;
      that.addForm.phone = '';
      that.addForm.user_name = '';
      that.addForm.user_id = '';
      that.addForm.meeting_id = '';
      that.addForm.enroll_meeting_number = '';
      that.addForm.enroll_meeting_name = '';
      that.addForm.meeting_type = '';
      that.addForm.typename = '';
      that.addForm.meeting_fengrun_type = '';
      that.addForm.cost = '';
      that.addForm.meeting_level = '';
      that.addForm.deal_meeting_id = '';
      that.addForm.deal_meeting_number = '';
      that.addForm.deal_meeting_name = '';
      that.dialogVisible6=false;
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    }*/
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .offlineOrder-page{
    .el-form-item{
      margin-bottom:10px;
    }
    .el-input.is-disabled .el-input__inner{
      color: #666;
    }
    .meeting-dialog{
      width: 80%;
      .scroller{
        height:60vh;
        overflow-y: auto;
      }
    }
  }
</style>
