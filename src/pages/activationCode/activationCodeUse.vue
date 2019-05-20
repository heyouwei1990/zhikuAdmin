<template>
  <div>
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="被使用人手机号">
          <el-input v-model="form.useUserPhone" placeholder="请输入被使用人手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="使用人手机号">
          <el-input v-model="form.givePhone" placeholder="请输入使用人手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item>
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
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column prop="id" label="序号" width="120"></el-table-column>
        <el-table-column prop="useUserNickName" label="被使用人昵称" width="120"></el-table-column>
        <el-table-column prop="useUserPhone" label="被使用人手机号" width="120"></el-table-column>
        <el-table-column prop="giveNickName" label="使用人昵称" width="120"></el-table-column>
        <el-table-column prop="givePhone" label="使用人手机号" width="120"></el-table-column>
        <el-table-column prop="number" label="使用数量" width="120"></el-table-column>
        <el-table-column label="使用时间" min-width="120">
          <template slot-scope="scope">{{new Date(scope.row.createtime*1000).format("yyyy-MM-dd")}}</template>
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
  name: 'activationCodeUse',
  data () {
    return {
      tableData: [],
      form: {
        useUserPhone:"",
        givePhone:"",
      },
      delItems:[],
      pageIndex:1,
      total:1,
      pageSize:20,
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
      this.$get('/backend/userCode/userRecordList',{
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
      this.$get('/backend/userCode/deleteCodeWaterByIds',{
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
        const tHeader = ['被使用人昵称', '被使用人手机号', '使用人昵称', '使用人手机号', '使用数量','使用时间'];
        const filterVal = ['userNickName', 'useUserPhone', 'giveNickName', 'givePhone', 'number' ,'createtime'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][5] = data[i][5]==0?"0":tool.timeFormat(data[i][5])//转赠时间
        }
        export_json_to_excel(tHeader, data, '激活码使用明细excel');
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
