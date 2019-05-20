<template>
  <div>
    <div class="search">
      <el-form ref="form" v-model="form" :inline="true">
        <el-form-item label="评论人手机号">
          <el-input v-model="form.phone" placeholder="请输入评论人手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="评论人">
          <el-input v-model="form.userName" placeholder="请输入评论人姓名" @keyup.enter.native="getData" ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.isDel" @change="getData" >
            <el-option label="全部" value=""></el-option>
            <el-option label="上架" value="0"></el-option>
            <el-option label="下架" value="1"></el-option>
          </el-select>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60"> </el-table-column>
        <el-table-column prop="commentid" width='100' label="编号"> </el-table-column>
        <el-table-column prop="userName" width='120' label="评论人"> </el-table-column>
        <el-table-column prop="phone" width='120' label="评论人手机"> </el-table-column>
        <el-table-column prop="name" width="120" label="评论时间">
          <template slot-scope="scope">{{new Date(scope.row.addTime*1000).format("yyyy-MM-dd hh:mm:ss")}}</template>
        </el-table-column>
        <el-table-column prop="isDel" :formatter='formatIsDel' width='120' label="状态"> </el-table-column>
        <el-table-column prop="content" min-width='120' label="评论内容"> </el-table-column>
        <el-table-column prop="name" width="120" label="操作">
          <template slot-scope="item">
            <el-button type='primary' size='mini' @click='edit(item)' v-if='item.row.isDel==1'>上架</el-button>
            <el-button type='primary' size='mini' @click='edit(item)' v-else>下架</el-button>
          </template>
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
export default {
  name: 'commentList',
  data () {
    return {
      tableData: [],
      form: {
        phone: '',
        isDel:'',
        userName:'',
      },
      delItems:[],
      pageIndex:1,
      pageSize:10,
      total:0,
      loading:false,
      meetingId:''
    }
  },
  created(){
  },
  mounted(){
    this.meetingId=this.$route.query.id;
    this.getData();
  },
  methods:{
    formatIsDel: function (row, column) {
      return row.isDel == 0 ? '上架' : row.isDel == 1 ? '下架' : '未知';
    },
    getData(){
      this.loading=true;
      this.$get('/backend/meeting/meetingWordsList',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        meetingId:this.meetingId,
        ...this.form,
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
    handleSelectionChange(data){
      this.delItems=data;
    },
    mulDelete(){
      let ids=[];
      for(let i=0;i<this.delItems.length;i++){
        ids.push(this.delItems[i].id);
      }
      var idsStr=ids.join(',');
      this.$get('/backend/meeting/deleteWordsByIds',{
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
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData();
    },
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData();
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },

    edit(item){
      this.$get('/backend/meeting/insertOrUpdateWords',{
        id:item.row.commentid,
        isDel:item.row.isDel==1?0:1
      }).then(r=>{
        if(r.status==0){
          this.$message.success(r.message);
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
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
    text-decoration: none;
    display: inline-block;
    width: 100%;
    height: 100%;
  }
  img.img{
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
  .el-menu--horizontal>.el-menu-item{
    height: 30px;
    line-height: 10px;
  }
</style>
