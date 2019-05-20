<template>
  <div>
    <div class="search">
      <el-form ref="form" v-model="form" :inline="true">
        <el-form-item label="报名人手机号">
          <el-input v-model="form.phone" placeholder="请输入报名人手机号" ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData" >查询</el-button>
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
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="60"> </el-table-column>
        <el-table-column prop="id" width='100' label="编号"> </el-table-column>
        <el-table-column prop="enrollMeetingNumber" width='120' label="会议编号"> </el-table-column>
        <el-table-column prop="enrollMeetingName" width='120' label="会议名称"> </el-table-column>
        <el-table-column prop="userName" width='120' label="报名人姓名"> </el-table-column>
        <el-table-column prop="phone" width='120' label="手机号码"> </el-table-column>
        <el-table-column width="120" label="报名时间">
          <template slot-scope="scope">{{new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column min-width="120" label="签到时间">
          <template slot-scope="scope">{{scope.row.isSign==0?'未签到':new Date(scope.row.isSign*1000).format("yyyy-MM-dd hh:mm")}}</template>
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
  </div>
</template>

<script>
  import tool from '@/vendor/tool'
export default {
  name: 'signUp',
  data () {
    return {
      tableData: [],
      form: {
        phone: ''
      },
      delItems:[],
      pageIndex:1,
      pageSize:10,
      activeIndex: '3',
      total:0,
      loading:false,
      uid:'',
    }
  },
  mounted(){
    this.uid=this.$route.query.id;
    this.getData();
  },
  methods:{
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/order/signup',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        meetingId:this.uid,
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
        const tHeader = ['编号', '会议编号', '会议名称', '报名人姓名', '手机号码','报名时间',"签到时间"];
        const filterVal = ['id', 'enrollMeetingNumber', 'enrollMeetingName', 'userName', 'phone' ,'addTime','isSign'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i=0;i<data.length;i++){
          data[i][5] = tool.timeFormat(data[i][5])//报名时间
          data[i][6] = tool.timeFormat(data[i][6])//签到时间
        }
        export_json_to_excel(tHeader, data, '报名管理excel');
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
    text-decoration: none;
    display: inline-block;
    width: 100%;
    height: 100%;
  }
</style>
