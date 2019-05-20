<template>
  <div>
    <div class="search">
      <el-form ref="searchForm" :model="searchForm">
        <el-input v-model="searchForm.phone" placeholder="会员手机号" style='width:200px; margin-right:10px;' @keyup.enter.native="onSubmit"></el-input>
        <el-input v-model="searchForm.name" placeholder="讲师名称"   style='width:200px; margin-right:10px;' @keyup.enter.native="onSubmit"></el-input>
        <el-button type="primary" size="small" @click="onSubmit">查询</el-button>
      </el-form>
    </div>
    <div class="table">
      <el-table ref="multipleTable" :data="tableData" v-loading='loading' highlight-current-row tooltip-effect="dark" style="width: 100%" @select='select' @select-all='select'>
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column prop="id" label="序号" width="120"> </el-table-column>
        <el-table-column prop="nick_name" label="会员昵称" width="120"> </el-table-column>
        <el-table-column prop="phone" label="会员手机号" width="120"> </el-table-column>
        <el-table-column prop="lecturer_name" label="讲师姓名" width="120"> </el-table-column>
        <el-table-column label="讲师头像" width="120">
          <template slot-scope='scope'>
            <img :src="scope.row.lecturer_picture">
          </template>
        </el-table-column>
        <el-table-column prop="lecturer_details" label="讲师简介" min-width="120"> </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">{{ scope.row.status==1?"开启":"关闭" }}</template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
          <el-button size="mini"  v-if='delAll'>批量删除</el-button>
          <el-button size="mini" disabled v-else>批量删除</el-button>
      </div>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" class='page' :current-page="page" :page-sizes="[1,10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import qs from 'qs'
export default {
  name: 'lecturerList',
  data () {
    return {
      tableData: [{}],
      type:"lecturer_picture",
      searchForm:{
        phone:'',
        name:'',
        status:'1'
      },
      delAll:false,
      dialogVisible:false,
      dialogVisible2:false,
      page:1,
      total:1,
      pageSize:20,
      addIsShow:true,
      editIsShow:true,
      loading:true
    }
  },
  mounted(){
    this.$nextTick(()=>{
      this.init(this.searchForm)
    })
  },
  methods:{
    handleSelectionChange(e){
      // console.log(e)
    },
    select(e){
      var len = e.length;
      if(len){
        this.delAll = true
      }else{
        this.delAll = false
      }
      this.$emit('ievent2', e);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.init(this.searchForm)
    },
    handleCurrentChange(val) {
      this.page = val;
      this.init(this.searchForm)
    },
    onSubmit(){
      var params = this.searchForm;
      this.init(params)
    },
    ievent(e){
      var url = e.data.url;
      this.addForm.lecturer_picture = imgUrl()+"/"+this.type+"/"+url;
      this.editForm.lecturer_picture = imgUrl()+"/"+this.type+"/"+url;
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    init(params){
      var that = this;
      params['token'] = window.sessionStorage.getItem("token");
      params['page'] = that.page;
      params['pageSize'] = that.pageSize;
      axios.post(process.env.API_ROOT+'/lecturer/index', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          var list = res.data.data.list;
          if(list){
            for(var i =0;i<list.length;i++){
              list[i]['lecturer_picture'] =imgUrl()+"/"+list[i]['lecturer_picture']
            }
            that.tableData = list;
            that.total = Number(res.data.data.pager.Counts);
            that.page = res.data.data.pager.page;
          }else{
            that.tableData = [];
            that.total = 1;
            that.page = 1;
          }

        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
        that.loading = false;
      })
      .catch(function(err){

      });
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
  img{
    width: 60px;
    height: 60px;
    border-radius: 50%
  }
</style>

