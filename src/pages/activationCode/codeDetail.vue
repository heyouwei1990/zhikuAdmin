<template>
  <div>
    <div class="table" style='clear:both'>
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        highlight-current-row
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="序号" width="120"></el-table-column>
        <el-table-column prop="codeNumber" label="已提取激活码的数字码" width="200"></el-table-column>
        <el-table-column prop="isUse" :formatter='formatIsUse' label="状态" width="120"></el-table-column>
        <el-table-column label="提取时间" width="120">
          <template slot-scope='scope'>{{scope.row.createTime==0?"无提取时间":new Date(scope.row.createTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="使用时间" width="120">
          <template slot-scope='scope'>{{scope.row.useTime==0?"无使用时间":new Date(scope.row.useTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="userName" label="使用会员昵称" width="120"></el-table-column>
        <el-table-column prop="phone" label="使用会员手机号" min-width="120"></el-table-column>
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
        :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'codeDetail',
  data () {
    return {
      uid:'',
      tableData: [],
      delItems:[],
      pageIndex:1,
      total:1,
      pageSize:10
    }
  },
  mounted(){
    this.uid=this.$route.query.id;
    this.getData();
  },
  methods:{
    //状态显示转换
    formatIsUse(row, column) {
      return row.isUse == 1 ? '已使用' : row.isUse == 0 ? '正常' : '未知';
    },

    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/userCode/detailList',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        id:this.uid
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
      this.$get('/backend/userCode/deleteDetailByIds',{
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
