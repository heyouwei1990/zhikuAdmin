<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder='会员手机号' @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="文章名称">
          <el-input v-model="form.title" placeholder='根据名称模糊搜索' @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="文章转载量">
          <el-select v-model="form.shareCnt" class='select' @change="getData">
            <el-option v-for="(item, index) in reprint" v-if="reprint.length>0" :key="index" :label="item.text" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="form.verify" class='select' @change="getData">
            <el-option v-for="(item, index) in verifyStatus" v-if="verifyStatus.length>0" :key="index" :label="item.text" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size='mini' @click="onSubmit">搜索</el-button>
          <!--<el-button type="primary" size='mini' @click="$router.push({path:'editArticle'})">新建</el-button>-->
          <el-button type="primary" size='mini' @click="export2Excel">导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        highlight-current-row
        @select='select'
        @select-all='select'
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <!--<el-table-column type="selection" width="40"> </el-table-column>-->
        <el-table-column prop="id" label="序号" width='50'> </el-table-column>
        <el-table-column prop="phone" label="会员手机号"> </el-table-column>
        <el-table-column prop="title" label="文章名称"> </el-table-column>
        <el-table-column label="文章缩略图">
          <template slot-scope="scope">
            <img class="thumbnail" :src="formatImg(scope.row.icon)" alt="">
          </template>
        </el-table-column>
        <el-table-column prop="categTitle" label="文章分类"></el-table-column>
        <el-table-column prop="author" label="文章来源"> </el-table-column>
        <el-table-column prop="browseCnt" label="文章浏览量"> </el-table-column>
        <el-table-column prop="likeCnt" label="文章点赞量"> </el-table-column>
        <el-table-column prop="shareCnt" label="文章转载量"> </el-table-column>
        <el-table-column label="更新时间">
          <template slot-scope="scope">{{scope.row.updateTime==0?"暂无更新时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注"> </el-table-column>
        <el-table-column label="产品详情" width="150" show-overflow-tooltip>
          <template slot-scope="item">
            <router-link :to="{path:'/editUserArticle',query:{id:item.row.id}}">
              <el-button size="mini" type="primary">编辑</el-button>
            </router-link>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" class='page' :current-page="pageIndex" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import tool from '@/vendor/tool'
  export default {
    data(){
      return{
        form:{
          phone:'',
          title:'',
          shareCnt:0,
          verify:0
        },
        typeList:[
          {
            text:'全部',
            value:0
          },
          {
            text:'推荐',
            value:1
          },
          {
            text:'热门',
            value:2
          },
          {
            text:'娱乐',
            value:3
          },
          {
            text:'生活',
            value:4
          },
          {
            text:'财经',
            value:5
          },
          {
            text:'医疗',
            value:6
          },
          {
            text:'科技',
            value:7
          },
          {
            text:'生物',
            value:8
          },
          {
            text:'资讯',
            value:9
          },
        ],
        reprint:[
          {
            text:'全部',
            value:0
          },
          {
            text:'正序',
            value:1
          },
          {
            text:'反序',
            value:2
          },
        ],
        verifyStatus:[
          {
            text:'全部',
            value:0
          },
          {
            text:'正序',
            value:1
          },
          {
            text:'反序',
            value:-1
          },
        ],
        tableData:[],
        pageIndex:1,
        total:0,
        pageSize:10,
        loading:false,
        checkedData:[],
        disableBtn:true,
      }
    },
    watch:{
      checkedData(v){
        if(v.length==0){
          this.disableBtn=true;
        }else{
          this.disableBtn=false;
        }
      }
    },
    mounted(){
      this.getData();
    },
    methods:{
      //补全表格图片路径
      formatImg(url){
        return url?tool.imgBaseUrl+'/'+url:'';
      },
      //获取数据
      getData(){
        this.loading=true;
        var obj={};
        //obj['token']=window.sessionStorage.getItem('token');
        obj['pages']=this.pageIndex;
        obj['size']=this.pageSize;
        var data=tool.extend(obj,this.form);
        this.$post('/backend/cms/getUserCms/'+data.pages+'?size='+data.size,data).then((r)=>{
          this.loading=false;
          if(r.returnCode===1){
            this.tableData=r.data;
//            this.pageIndex=r.pages;
            this.total=r.sizes;
          }
        }).catch((err)=>{
          //console.log(err)
        });
      },
      //查询
      onSubmit(){
        this.getData();
      },
      //导出
      export2Excel(){
        require.ensure([], () => {
          const { export_json_to_excel } = require('../../vendor/Export2Excel');
          const tHeader = ['文章id','会员手机号','文章名称', '文章缩略图', '文章分类', '文章来源', '文章浏览量','文章点赞量','文章转载量','更新时间','备注'];
          const filterVal = ['id','phone','title', 'icon', 'categId', 'author', 'browseCnt','likeCnt','shareCnt','updateTime','remark'];
          const list = this.tableData;
          const data = tool.formatJson(filterVal, list);
          for(var i=0;i<data.length;i++){
            data[i][3] = data[i][3]==''?"无":this.formatImg(data[i][3]);
            data[i][9] = data[i][9]==0?"0":tool.timeFormat(data[i][9]);
          }
          export_json_to_excel(tHeader, data, '用户文章列表excel');
        })
      },
      //改变选中条目
      handleSelectionChange(data){
        this.checkedData=data;
      },
      //选中条目
      select(e){
        var len = e.length;
        if(len){
          this.delAll = true
        }else{
          this.delAll = false
        }
      },
      //改变每页显示数量
      handleSizeChange(data){
        this.pageSize=data;
        this.getData();
      },
      //分页跳转
      handleCurrentChange(data){
        this.pageIndex=data;
        this.getData();
      },
    }
  }
</script >

<style scoped>
  .thumbnail{
    display: block;
    width: 100%;
    height:auto;
  }
</style>
