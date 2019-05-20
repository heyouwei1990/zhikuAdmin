<template>
  <div>
    <div class="search">
      <el-form ref="form" :model="form" :inline="true">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" @keyup.enter.native="getData"></el-input>
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
        <!--<el-table-column type="selection" width="55"></el-table-column>-->
        <el-table-column  prop="id" label="序号" width="80"> </el-table-column>
        <el-table-column  prop="nickName" label="会员昵称" width="160"> </el-table-column>
        <el-table-column  prop="phone"  label="会员手机号" width="160"> </el-table-column>
        <el-table-column  prop="totalAmount" label="总收益"  width="160"></el-table-column>
        <el-table-column  prop="freezingMoney"  label="冻结收益" width="160"></el-table-column>
        <el-table-column  prop="thawMoney" label="已解冻收益"  min-width="160"></el-table-column>
        <el-table-column  prop="alreadypresented" label="已提现金额"  min-width="160"></el-table-column>
        <el-table-column  prop="price" label="可提现金额"  min-width="160"></el-table-column>
        <el-table-column  prop="inthepresent" label="提现中金额"  min-width="160"></el-table-column>
      </el-table>
    </div>
    <div id="page">
      <!--<div class="batch">
        <el-button size="mini" type='danger' :disabled="delItems.length==0" @click="mulDelete">批量删除</el-button>
      </div>-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class='page'
        :current-page="pageIndex"
        :page-sizes="[1, 10, 20, 30, 40]"
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
  data () {
    return {
      tableData: [],
      form: {
        phone:''
      },
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
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/user/Amountstatistics',{
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
      this.$get('/backend',{
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
        const tHeader = ['会员昵称', '会员手机号', '总收益', '冻结收益', '已解冻收益','已提现金额','可提现金额','提现中金额'];
        const filterVal = ['nickName', 'phone', 'totalAmount', 'freezingMoney', 'thawMoney','alreadypresented','price','inthepresent'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        export_json_to_excel(tHeader, data, '会员余额excel');
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

<!--  -->
