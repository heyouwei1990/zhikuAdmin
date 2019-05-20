<template>
  <div>
    <div class="search">
      <el-form :inline="true" ref="form" :model="form">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="会员手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="名片名称">
          <el-input v-model="form.cardName" placeholder="名片名称" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.isDel" @change="getData" >
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源标签">
          <el-select v-model="form.type" @change="getData" >
            <el-option label="全部" value="0"></el-option>
            <el-option v-for="item in markList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column prop="phone" label="会员手机号" min-width="110"></el-table-column>
        <el-table-column prop="cardName" label="名片姓名" min-width="80"></el-table-column>
        <el-table-column prop="img" label="名片logo" min-width="80">
          <template slot-scope='scope'>
            <img :src="formatImg(scope.row.cardLogo)">
          </template>
        </el-table-column>
        <el-table-column prop="cardPhone" label="名片手机号" width="120"></el-table-column>
        <el-table-column prop="cardDuty" label="现任职务" min-width="80"></el-table-column>
        <el-table-column prop="cardCompany" label="公司信息" min-width="120"></el-table-column>
        <el-table-column prop="typeName" label="资源标签" min-width="120"></el-table-column>
        <el-table-column prop="browseCnt" label="浏览量" min-width="60"></el-table-column>
        <el-table-column label="更新时间" width="100">
          <template slot-scope="scope">{{scope.row.updateTime==0?"无更新时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="isDel" :formatter='formatIsDel' label="状态" min-width="50"></el-table-column>
        <el-table-column prop="delMessage"  label="备注" min-width="120"></el-table-column>
        <el-table-column label="操作" width='120' show-overflow-tooltip >
          <template slot-scope="scope">
            <el-button size='mini' type='primary' v-if="editIsShow" @click="$router.push({path:'/businessCardDetails',query:{id:scope.row.id}})">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini" type="danger" :disabled="delItems.length==0" @click="mulDelete" >批量删除</el-button>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class='page' :current-page="pageIndex"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import qs from 'qs'
  import { imgUrl,timeFormat } from '../../../config/common';
  import tool from '@/vendor/tool';
export default {
  name: 'businessCard',
  data () {
    return {
      tableData: [],
      form: {
        cardName: '',
        phone:'',
        isDel:'',
        type:''
      },
      options: [{
        value: '',
        label: '全部'
      }, {
        value: '0',
        label: '上架'
      }, {
        value: '1',
        label: '下架'
      }],
      delItems:[],
      pageIndex:1,
      total:1,
      pageSize:10,
      value2:"下架",
      loading:false,
    }
  },
  computed:{
    editIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
    markList () {
      return this.$store.state.cardTypes;
    }
  },
  created(){
    if(this.markList.length==0){
      this.$store.dispatch('getCardTypes');
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
    formatIsDel(row, column) {
      return row.isDel == 0 ? '上架' : row.isDel == 1 ? '下架' : '未知';
    },
    // 获取数据
    getData(){
      this.loading = true;
      this.$get('/backend/userCard/list', {
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        ...this.form
      })
        .then((r)=>{
          this.loading = false;
          if(r.status==0){
            this.tableData = r.data;
            this.total = Number(r.total);
          }else{
            this.$message({
              showClose: true,
              message: r.message,
              type: 'success'
            });
          }
        }).catch((err)=>{
        this.$message.error(err.message);
        this.loading = false;
      });
    },
    //选中的条目
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
      this.$get('/backend/userCard/deleteByIds',{
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
    //改变每页条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData()
    },
    //切换当前页
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData()
    },
    /*//关闭弹窗
    handleClose(done) {
      this.$confirm('确认关闭？')
      .then(_ => {
        done();
      })
      .catch(_ => {});
    },
    edit(item){
      var is_del = item.row.is_del;
      var id = item.row.id,that = this;
      var params = {};
        params['token'] = window.sessionStorage.getItem("token");
        params['id'] = id;
        params['is_del'] = is_del==0?1:0;
      axios.post(process.env.API_ROOT+'/user/updateCardStatus', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.getData(that.form)
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    getStorage(){
      var rules = window.sessionStorage.getItem("rules");
      if(rules == '*'){
        this.editIsShow = true;
        return;
      }
      var menuList = JSON.parse(window.sessionStorage.getItem("menuList"));
      for(var i = 0;i < menuList.length;i++){
        if(rules.indexOf(menuList[i]['id'])!=-1){
          if(menuList[i]['action_id']=='user/updatecardstatus'){
            if(menuList[i]['show_button']==1){
              this.editIsShow = true;
            }else{
              this.editIsShow = false;
            }
          }
        }
      }
    },*/
    //导出
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['会员手机号', '名片姓名', '名片手机号', '现任职务', '公司信息','资源标签','浏览量','更新时间','状态','备注'];
        const filterVal = ['phone', 'cardName', 'cardPhone', 'cardDuty', 'cardCompany' ,'typeName','browseCnt','updateTime','isDel','delMessage'];
        const list = this.tableData;
        const data = this.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][7] = !data[i][7]?"":tool.timeFormat(data[i][7])//转赠时间
          data[i][8] = data[i][8]==false ? '上架' : data[i][8] == true ? '下架' : '未知';
        }
        export_json_to_excel(tHeader, data, '名片列表excel');
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
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
