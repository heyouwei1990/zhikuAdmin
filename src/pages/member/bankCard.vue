<template>
  <div class="bankCard-page">
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="会员手机号" >
          <el-input v-model="form.userPhone" placeholder="请输入会员手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="" >
          <el-button type="primary" size="small" @click="getData">查询</el-button>
          <el-button type='primary' size='small' class='create' @click='export2Excel'>导出</el-button>
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
        @selection-change="handleSelectionChange"
        style="width: 100%" >
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="id" label="序号"> </el-table-column>
        <el-table-column prop="nikeName" label="会员昵称"> </el-table-column>
        <el-table-column prop="userPhone" label="会员手机号"> </el-table-column>
        <el-table-column prop="realName" label="真实姓名"> </el-table-column>
        <el-table-column prop="bankName" label="银行名称"> </el-table-column>
        <el-table-column prop="bankNo" label="银行行号"> </el-table-column>
        <el-table-column prop="subBranchName" label="支行名称"> </el-table-column>
        <el-table-column prop="bankCardNo" label="银行卡号"> </el-table-column>
        <el-table-column prop="phone" label="预留手机号"> </el-table-column>
        <el-table-column label="绑卡时间">
          <template slot-scope="scope">{{scope.row.addTime==0?"":new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" :formatter='formatStatus' show-overflow-tooltip></el-table-column>
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
  name: 'bankCard',
  data () {
    return {
      tableData: [],
      form: {
        userPhone: ''
      },
      delItems:[],
      pageIndex:1,
      pageSize:10,
      total:1,
      loading:false
    }
  },
  mounted(){
    this.getData();
  },
  methods:{
    formatStatus: function (row, column) {
      return row.status == 0 ? '激活' : row.status == 1 ? '失效': '未知';
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/user/bankList',{
        ...this.form,
        startPage:this.pageIndex,
        pageSize:this.pageSize
      }).then(r=>{
        this.loading=false;
        if(r.status==0){
          this.total=r.total;
          this.tableData=r.data;
        }
      }).catch(err=>{
        this.loading=false;
        this.$message.error(err.message);
      })
    },
    //改变每页条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData();
    },
    //切换当前页
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData();
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
      this.$get('/backend/user/deleteBankByIds',{
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
    //导出
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['会员昵称','会员手机号', '真实姓名', '银行名称', '银行行号', '支行名称', '银行卡号', '预留手机号', '绑卡时间', '状态'];
        const filterVal = ['nikeName','userPhone', 'realName', 'bankName', 'bankNo', 'subBranchName', 'bankCardNo', 'phone', 'addTime', 'status'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i=0;i<data.length;i++){
          data[i][8] = data[i][8]==0?"0":tool.timeFormat(data[i][8]);
          data[i][9] = data[i][9] == 0 ? '激活' : data[i][9] == 1 ? '失效': '未知';
        }
        export_json_to_excel(tHeader, data, '银行卡管理excel');
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  /*.bankCard-page{

  }*/
</style>
