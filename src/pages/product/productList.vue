<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder='手机号'></el-input>
        </el-form-item>
        <el-form-item label="产品简称">
          <el-input v-model="form.abbreviation" placeholder='产品简称'></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size='mini' @click="getData">查询</el-button>
          <el-button type="primary" size='mini' @click="export2Excel">导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        v-loading="loading"
        highlight-current-row
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="id" label="序号" width='50'> </el-table-column>
        <el-table-column prop="phone" label="会员手机号"> </el-table-column>
        <el-table-column prop="abbreviation" label="产品简称"> </el-table-column>
        <el-table-column label="产品缩略图">
          <template slot-scope="scope">
            <img :src="scope.row.minificationUrl" style="width: 100px;height: 100px">
          </template>
        </el-table-column>
        <el-table-column prop="name" label="产品名称"> </el-table-column>
        <el-table-column prop="typeName" label="产品分类"> </el-table-column>
        <el-table-column prop="placeOfOrigin" label="产品产地"> </el-table-column>
        <el-table-column prop="price" label="产品价格"> </el-table-column>
        <el-table-column label="更新时间">
          <template slot-scope="scope">{{!scope.row.updateTime?"暂无更新时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" show-overflow-tooltip v-if="isShow">
          <template slot-scope="item">
            <router-link :to="{path:'/productDetails',query:{id:item.row.id}}">
              <el-button size="mini" type="primary">产品详情</el-button>
            </router-link>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini" :disabled="delItems.length==0" type='danger' @click="mulDelete">批量删除</el-button>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class='page'
        :current-page="pageIndex"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import tool from '@/vendor/tool'
export default {
  name: 'productList',
  data () {
    return {
      tableData: [],
      form: {
        phone:"",
        abbreviation:"",
      },
      loading:false,
      delItems:[],
      pageIndex:1,
      total:1,
      pageSize:10,
    }
  },
  computed:{
    isShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
  },
  mounted(){
    this.getData();
  },
  methods:{
    //选择多个
    handleSelectionChange(data){
      this.delItems=data;
    },
    //删除多个
    mulDelete(){
      let ids=[];
      for(let i=0;i<this.delItems.length;i++){
        ids.push(this.delItems[i].id);
      }
      var idsStr=ids.join(',');
      this.$get('/backend/commodity/deleteByIds',{
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
      })
    },
    //更改每页条数
    handleSizeChange(val) {
     this.pageSize = val;
     this.getData();
    },
    //切换当前页
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData();
    },
    //关闭弹框
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    //获取列表
    getData(){
      this.loading=true;
      this.$get('/backend/commodity/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        ...this.form
      }).then(r=>{
        this.loading=false;
        if(r.status==0){

          for(var i = 0;i<r.data.length;i++){
            r.data[i]['minificationUrl'] = tool.imgBaseUrl+"/"+r.data[i]['minificationUrl']
          }
          this.tableData = r.data;
          this.total = r.total;
        }
      }).catch(err=>{
        this.loading=false;
        this.$message.error(err.message);
      })
    },
    /*getStorage(){
      var rules = window.sessionStorage.getItem("rules");
      if(rules == '*'){
        this.editIsShow = true;
        return;
      }
      var menuList = JSON.parse(window.sessionStorage.getItem("menuList"));
      for(var i = 0;i < menuList.length;i++){
        if(rules.indexOf(menuList[i]['id'])!=-1){
          if(menuList[i]['action_id']=='commodity/detail'){
            console.log(menuList[i]['show_button'])
            if(menuList[i]['show_button']==1){
              this.editIsShow = true;
            }else{
              this.editIsShow = false;
            }
          }

        }
      }
    },*/
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['产品id','会员手机号', '产品简称', '产品名称', '产品分类', '产品产地','产品价格','更新时间'];
        const filterVal = ['id','phone', 'abbreviation', 'name', 'typeName', 'placeOfOrigin','price','updateTime'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i=0;i<data.length;i++){
          data[i][7] = data[i][7]==0?"0":tool.timeFormat(data[i][6])
        }
        export_json_to_excel(tHeader, data, '产品列表excel');
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
