<template>
  <div>
    <div class="search">
      <el-form ref="form" :model="form" :inline="true">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" ></el-input>
        </el-form-item>
        <el-form-item label="订单编号">
          <el-input v-model="form.orderNo" placeholder="请输入来源订单编号" ></el-input>
        </el-form-item>
        <el-form-item label="分润状态">
          <el-select v-model="form.status" >
            <el-option  v-for="item in options" :key="item.value"  :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click='getData'>搜索</el-button>
          <el-button type="primary" size="small" class='create' @click='export2Excel'>导出</el-button>
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
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="序号" width="60"></el-table-column>
        <el-table-column prop="userName" label="会员昵称"></el-table-column>
        <el-table-column prop="phone" label="会员手机号"></el-table-column>
        <el-table-column prop="levelName" label="会员级别"></el-table-column>
        <el-table-column prop="orderNo" label="来源订单编号"></el-table-column>
        <el-table-column prop="orderAmount" label="订单金额"></el-table-column>
        <el-table-column prop="meetingFengrunType" :formatter='formatMft' label="分润类型"></el-table-column>
        <el-table-column prop="platformAmount" label="平台总分润金额"></el-table-column>
        <el-table-column prop="shareType" :formatter="formatType" label="来源类型" ></el-table-column>
        <el-table-column prop="shareMoney" label="分润金额" ></el-table-column>
        <el-table-column prop="netEarning" label="净收益" ></el-table-column>
        <el-table-column prop="status" :formatter='formatStatus' label="分润状态" ></el-table-column>
        <el-table-column prop="addTime" label="订单时间" >
          <template slot-scope="scope">{{!scope.row.addTime?'未知':new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="remark"  label="备注" ></el-table-column>
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
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>
<script>
  import tool from '@/vendor/tool'
export default {
  name: 'revenueStream',
  components:{

  },
  data () {
    return {
      tableData: [],
      form: {
        phone: '',
        orderNo:'',
        status:''
      },
      options: [{
        value: '',
        label: '全部'
      }, {
        value: '0',
        label: '冻结'
      }, {
        value: '1',
        label: '发放'
      }],
      delItems:[],
      pageIndex:1,
      pageSize:10,
      total:0,
      loading:false
    }
  },
  mounted(){
    this.getData();
  },
  methods:{
    formatMft: function (row, column) {
      return row.meetingFengrunType == 0 ? '正常会议' : row.meetingFengrunType == 1 ? '398特殊会议' : '其他';
    },
    formatStatus: function (row, column) {
      return row.status == 0 ? '冻结' : row.status == 1 ? '发放' : '未知';
    },
    //格式化来源类型
    formatType(row,column){
      return this.shareType(row.shareType);
    },
    //来源类型
    shareType(data){
      let str='';
      switch (data){
        case 1:
          str='会员分润';
          break;
        case 2:
          str='会员红利';
          break;
        case 3:
          str='讲师分润';
          break;
        case 4:
          str='代理分润';
          break;
        case 5:
          str='讲师中踪分润';
          break;
      }
      return str;
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$post('/backend/moneystream/list',{
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
      this.$get('/backend/lecturer/deleteByIds',{
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
        const tHeader = ['会员昵称', '会员手机号', '会员级别', '来源订单编号', '订单金额','分润类型','平台总分润金额','来源类型','分润金额','净收益','分润状态','订单时间','备注'];
        const filterVal = ['userName', 'phone', 'levelName', 'orderNo', 'orderAmount','meetingFengrunType','platformAmount','shareType','shareMoney','netEarning','status','addTime','remark'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i=0;i<data.length;i++){
          data[i][5] = data[i][5]==0 ? '正常会议' :  data[i][5] == 1 ? '398特殊会议' : '其他';;
          data[i][10] = data[i][10]==0 ? '冻结' : data[i][10] == 1 ? '发放' : '未知';
          data[i][7] = this.shareType(data[i][7]);
          data[i][11] = tool.timeFormat(data[i][11]);
        }
        export_json_to_excel(tHeader, data, '收益流水excel');
      })
    },
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
