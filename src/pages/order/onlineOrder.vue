<template>
  <div class="onlineOrder-page">
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="报名会议">
          <el-input v-model="form.enrollMeetingName" placeholder="请输入报名会议主题" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="form.payStatus" @change="getData">
            <el-option label="全部" value=""></el-option>
            <el-option label="未支付" value="0"></el-option>
            <el-option label="已支付" value="1"></el-option>
            <el-option label="已取消" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
          <el-button type='primary' size='small' @click='export2Excel' class='create'>导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table" style="clear: both;">
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
        <el-table-column prop="meetingTypeName" label="报名会议种类"></el-table-column>
        <el-table-column prop="meetingFengrunType" :formatter='formMeetingFengrunType' label="报名会议分润类型"> </el-table-column>
        <el-table-column prop="meetingLevel" :formatter='formMeetingLevel' label="报名会议所属权限"> </el-table-column>
        <el-table-column prop="addTime" label="报名时间">
          <template slot-scope="scope">{{scope.row.addTime==0?"":new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="cost" label="报名费用"></el-table-column>
        <el-table-column prop="realCost" label="实际费用"></el-table-column>
        <el-table-column prop="type" :formatter='formatType' label="支付方式"></el-table-column>
        <el-table-column prop="payStatus" :formatter="formatStatus" label="支付状态"></el-table-column>
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
  </div>

</template>

<script>
  import tool from '@/vendor/tool'
export default {
  name: 'onlineOrder',
  data () {
    return {
      tableData: [],
      form: {
        type:1,
        phone:'',
        enrollMeetingName: '',
        payStatus: '',
      },
      delItems:[],
      pageIndex: 1,
      pageSize:10,
      total:0,
      loading:false
    }
  },
  mounted(){
    this.getData();
  },
  methods:{//状态显示转换
    formatStatus(row, column) {
      return row.payStatus == 0 ? '未支付' : row.payStatus == 1 ? '已支付': row.payStatus == 2 ? '已取消' : '未知';
    },
    formatType(row, column) {
      return row.type == 1 ? '线上' : row.type == 0 ? '线下': '未知';
    },
    formMeetingFengrunType(row,column){
      return row.meetingFengrunType == 0 ? '正常分润会议' : row.meetingFengrunType == 1 ? '398特殊分润会议': '未知';
    },
    formMeetingLevel(row,column){
      return this.getLevel(row.meetingLevel);
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
            list[i]['meetingTypeName']=list[i].meetingTypeInfo.typename
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
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['订单编号', '会员昵称', '会员手机号', '报名会议编号', '报名会议主题','报名会议种类',"报名会议分润类型","报名会议所属权限","报名时间","报名费用","实际费用","支付方式","支付状态"];
        const filterVal = ['orderNo', 'userName', 'phone', 'enrollMeetingNumber', 'enrollMeetingName' ,'meetingTypeName','meetingFengrunType','meetingLevel','addTime','cost','realCost','type','payStatus'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][6] = data[i][6]==0 ? '正常分润会议' : data[i][6] == 1 ? '398特殊分润会议': '未知';
          data[i][7] = this.getLevel(data[i][7]);
          data[i][8] = tool.timeFormat(data[i][8])//报名时间
          data[i][11] = data[i][11]==1 ? '线上' : data[i][11] == 0 ? '线下': '未知';
          data[i][12] = data[i][12]==0 ? '未支付' : data[i][12] == 1 ? '已支付': data[i][12] == 2 ? '已取消' : '未知';//支付状态
        }
        export_json_to_excel(tHeader, data, '线上订单excel');
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.onlineOrder-page{

}
</style>
