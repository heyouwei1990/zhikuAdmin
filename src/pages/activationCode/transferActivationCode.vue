<template>
  <div>
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="发起人手机号">
          <el-input v-model="form.userPhone" placeholder="请输入发起人手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="接收人手机号">
          <el-input v-model="form.givePhone" placeholder="请输入接收人手机号"  @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="form.from" @change="getData">
            <el-option label="全部" value=""></el-option>
            <el-option label="APP" value="1"></el-option>
            <el-option label="后台" value="2"></el-option>
          </el-select>
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
        tooltip-effect="dark"
        highlight-current-row
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="序号" width="120"></el-table-column>
        <el-table-column prop="userNickName" label="发起人昵称" width="120"></el-table-column>
        <el-table-column prop="userPhone" label="发起人手机号" width="120"></el-table-column>
        <el-table-column prop="giveNickName" label="接收人昵称" width="120"></el-table-column>
        <el-table-column prop="givePhone" label="接收人手机号" width="120"></el-table-column>
        <el-table-column prop="number" label="转赠数量" width="120"></el-table-column>
        <el-table-column label="转赠时间" width="120">
          <template slot-scope="scope">{{scope.row.createtime==0?"":new Date(scope.row.createtime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="类型" width="120" prop="type"  :formatter='formatType'></el-table-column>
        <el-table-column prop="from" :formatter='formatFrom' label="来源" width="120"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120"></el-table-column>
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
  name: 'lecturerList',
  components:{

  },
  data () {
    return {
      tableData: [],
      form: {
        userPhone:"",
        givePhone:"",
        from:""
      },
      delItems:[],
      pageIndex:1,
      total:1,
      pageSize:10,
      loading:false
    }
  },
  mounted(){
    this.getData();
  },
  methods:{
    //来源显示转换
    formatFrom(row, column) {
      return row.from == 1 ? 'APP' : row.from == 2 ? '后台' : '未知';
    },
    //状态显示转换
    formatType(row, column){
      return this.transType(row.type);
    },
    transType(data){
      let str='';
      switch (data){
        case 1:
          str='激活';
          break;
        case 2:
          str='后台增加';
          break;
        case 3:
          str='转入';
          break;
        case 4:
          str='转出';
          break;
        case 5:
          str='后台减少';
          break;
      }
      return str;
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/userCode/codeWaterList',{
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
    //导出
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['发起人昵称', '发起人手机号', '接收人昵称', '接收人手机号', '转赠数量','转赠时间',"类型","来源","备注"];
        const filterVal = ['userNickName', 'userPhone', 'giveNickName', 'givePhone', 'number' ,'createtime','type','from','remark'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][5] = data[i][5]==0?"0":tool.timeFormat(data[i][5])//转赠时间
          data[i][6] = this.transType(data[i][6]);//变更时间
          data[i][7] = data[i][7]==1?"App":'后台'//变更时间
        }
        export_json_to_excel(tHeader, data, '激活码转赠明细excel');
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
