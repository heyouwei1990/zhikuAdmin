<template>
  <div>
    <div class="search">
      <el-form ref="form"  v-model="form" :inline="true">
        <el-form-item label="分享人手机号">
          <el-input v-model="form.phone" placeholder="请输入分享人手机号" ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
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
        <el-table-column  type="selection"  width="40"> </el-table-column>
        <el-table-column  prop="id" width='100'  label="编号"> </el-table-column>
        <el-table-column  prop="userName"  width='120' label="分享人"> </el-table-column>
        <el-table-column  prop="phone"  width='120' label="分享人手机"> </el-table-column>
        <el-table-column prop="name" width="120" label="分享时间">
          <template slot-scope="scope">{{new Date(scope.row.lastShareTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column  prop="shareNums" min-width='120'  label="转发量">  </el-table-column>
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
  import { isLogin} from '../../../config/common';
export default {
  data () {
    return {
      tableData: [],
      form: {
        phone: ''
      },
      delItems:[],
      activeIndex: 1,
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
      this.$get('/backend/meeting/meetingShareList',{
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
      this.$get('/backend/meeting/deleteShareByIds',{
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
  .el-menu--horizontal>.el-menu-item{
    height: 30px;
    line-height: 10px;
  }
</style>
