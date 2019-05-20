<template>
  <div>
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="会员手机号">
          <el-input v-model="form.phone" placeholder="请输入会员手机号"  @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
          <el-button type="primary" size="small" class='create' @click="export2Excel">导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        v-loading='loading'
        highlight-current-row
        tooltip-effect="dark"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column prop="id" label="序号" width="120"> </el-table-column>
        <el-table-column prop="nickName" label="会员昵称" width="120"> </el-table-column>
        <el-table-column prop="phone" label="会员手机号" width="120"> </el-table-column>
        <el-table-column prop="level" label="会员权限等级" width="120"> </el-table-column>
        <el-table-column prop="orderId" label="来源订单号" width="120"> </el-table-column>
        <el-table-column label="获得时间" width="120">
          <template slot-scope="scope">{{new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="变更时间" min-width="120">
          <template slot-scope="scope">{{new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
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
  </div>
</template>

<script>
  import tool from '@/vendor/tool'
export default {
  name: 'sponsorFans',
  data () {
    return {
      tableData: [],
      delItems:[],
      pageIndex:1,
      total:0,
      pageSize:10,
      form:{
        phone:''
      },
      loading:false
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
      this.$get('/backend/sponsor/userSponVipList',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        sponsorId:this.uid,
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
      this.$get('/backend/user/userSponVipDeleteByIds',{
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
        const tHeader = ['会员昵称', '会员手机号', '会员权限等级', '来源订单号', '获得时间','变更时间'];
        const filterVal = ['nickName','phone', 'level', 'orderId', 'addTime', 'updateTime' ];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][4] = tool.timeFormat(data[i][4])//获得时间
          data[i][5] = tool.timeFormat(data[i][5])//变更时间
        }
        var name = this.$route.query.name;
        export_json_to_excel(tHeader, data, '主办方'+name+'旗下会员列表excel');
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
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
