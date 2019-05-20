<template>
  <div class="sponsorList-page">
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="会员手机号">
          <el-input v-model="form.phone" placeholder="请输入会员手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="主办方名称">
          <el-input v-model="form.sponsorname" placeholder="请输入主办方名称" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="全部" value=""></el-option>
            <el-option label="关闭" value="0"></el-option>
            <el-option label="开启" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
          <el-button type="primary" size="small" v-show="!isComponent" @click='export2Excel' >导出</el-button>
          <el-button type="primary" size="small" v-if="addIsShow" v-show="!isComponent" class='create' @click="create">新建</el-button>
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
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @cell-click="cellClick"
      >
        <el-table-column type="selection" width="40" v-if="!isComponent"> </el-table-column>
        <el-table-column prop="sponsorid" label="序号" min-width="50"> </el-table-column>
        <el-table-column prop="no" label="主办方编号" min-width="120"> </el-table-column>
        <el-table-column prop="nickName" label="会员昵称" min-width="110"> </el-table-column>
        <el-table-column prop="phone" label="会员手机号" min-width="110"> </el-table-column>
        <el-table-column prop="sponsorname" label="主办方名称" min-width="100"> </el-table-column>
        <el-table-column label="logo" min-width="100">
          <template slot-scope='scope'>
            <img class="logo" v-if="scope.row.sponsorurl" :src="formatImg(scope.row.sponsorurl)">
          </template>
        </el-table-column>
        <el-table-column prop="sponsorphone" label="主办方联系方式" min-width="110"> </el-table-column>
        <el-table-column prop="updatetime" label="变更时间" min-width="100">
          <template slot-scope="scope">{{scope.row.updatetime==0?"无变更时间":new Date(scope.row.updatetime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="80">
          <template slot-scope='scope'>{{scope.row.status==0?"关闭":"开启"}}</template>
        </el-table-column>
        <el-table-column prop="sponsorintro" label="主办方简介" min-width="120"> </el-table-column>
        <el-table-column min-width="120" label="旗下会员" v-if="!isComponent">
          <template slot-scope="item">
            <router-link :to="{path:'/sponsorFans',query:{id:item.row.sponsorid,name:item.row.sponsorname}}">
              <el-button size="mini" type="warning">查看</el-button>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" v-if="!isComponent">
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)' v-if="editIsShow">编辑</el-button>
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
        :total="total"></el-pagination>
    </div>
    <!-- 修改主办方 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="120px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" :disabled="editId>0" @blur="getName"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="editForm.nickName" disabled></el-input>
        </el-form-item>
        <el-form-item label="主办方名称" prop="sponsorname">
          <el-input v-model="editForm.sponsorname"></el-input>
        </el-form-item>
        <el-form-item label="主办方联系方式" prop="sponsorphone">
          <el-input v-model="editForm.sponsorphone"></el-input>
        </el-form-item>
        <el-form-item label="主办方logo" prop="sponsorurl">
          <uploader
            :fileName="fileName"
            @success="filePic"
            @remove="removePic"
            :image="logoUrl"
          ></uploader>
        </el-form-item>
        <el-form-item label="主办方简介" prop="sponsorintro">
          <el-input type="textarea" v-model="editForm.sponsorintro"></el-input>
        </el-form-item>
        <el-form-item label="主办方状态" prop="status">
          <el-select v-model="editForm.status">
            <el-option label="开启" value="1"></el-option>
            <el-option label="关闭" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import tool from '@/vendor/tool'
  import uploader from '@/components/uploader'
export default {
  name: '',
  components:{
    uploader
  },
  data () {
    var validatePhone=(rule,value,callback)=>{
      if(!/^((13[0-9])|(14[5,7,9])|(15[^4])|(18[0-9])|(17[0,1,3,5,6,7,8]))\d{8}$/g.test(value)){
        callback(new Error('手机号格式不正确'))
      }else{
        callback();
      }
    };
    return {
      fileName:"sponsor",
      tableData: [],
      form:{
        phone:'',
        sponsorname:'',
        status:''
      },
      editForm: {
        nickName:'',
        phone:'',
        sponsorname:'',
        sponsorurl:'',
        sponsorphone:'',
        sponsorintro:'',
        status:'1'
      },
      rules:{
        phone:[
          {required:true,message:'请输入手机号',trigger:'blur'},
          {validator:validatePhone, trigger:'blur'}
        ],
        sponsorname:[{required:true,message:'请输入主办方名称',trigger:'blur'}],
        sponsorphone:[{required:true,message:'请输入主办方联系方式',trigger:'blur'}],
        sponsorurl:[{required:true,message:'请上主办方logo',trigger:'blur'}],
        sponsorintro:[{required:true,message:'请输入主办方简介',trigger:'blur'}],
        status:[{required:true,message:'请选择主办方状态',trigger:'blur'}],
      },
      logoUrl:'',
      editId:null,
      editTitle:'',
      delItems:[],
      editVisible:false,
      pageIndex:1,
      total:1,
      pageSize:10,
      loading:false,
    }
  },
  props:{
    isComponent:{
      type:Boolean,
      default:false
    }
  },
  computed:{
    editIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
    addIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
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
      this.$get('/backend/sponsor/list',{
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
        ids.push(this.delItems[i].sponsorid);
      }
      var idsStr=ids.join(',');
      this.$get('/backend/sponsor/deleteByIds',{
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
    //创建
    create(){
      this.editTitle='新建主办方';
      this.editId=null;
      this.editVisible=true;
    },
    //编辑
    edit(item){
      this.editTitle='编辑主办方';
      this.editId=item.row.sponsorid;
      this.editForm.phone = item.row.phone;
      this.editForm.nickName = item.row.nickName;
      this.editForm.sponsorname = item.row.sponsorname;
      this.editForm.sponsorphone = item.row.sponsorphone;
      this.editForm.sponsorintro = item.row.sponsorintro;
      this.editForm.status = item.row.status+'';
      this.editForm.sponsorurl = item.row.sponsorurl;
      this.logoUrl=this.formatImg(item.row.sponsorurl);
      this.editVisible=true;
    },
    //上传
    filePic(data){
      this.editForm.sponsorurl=data.response.result;
      this.logoUrl=tool.imgBaseUrl+'/'+data.response.result;
    },
    //删除
    removePic(){
      this.editForm.sponsorurl='';
      this.logoUrl='';
    },
    //关闭弹框
    handleClose() {
      this.$confirm('确认关闭？').then(_ => {
        this.editVisible=false;
        this.resetForm();
      }).catch(_ => {});
    },
    //清空表单
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editId=null;
      this.editForm.phone = '';
      this.editForm.nickName = '';
      this.editForm.sponsorname = '';
      this.editForm.sponsorphone = '';
      this.editForm.sponsorintro = '';
      this.editForm.status = '';
      this.editForm.sponsorurl = '';
      this.logoUrl='';
    },
    //提交编辑表单
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          var params={};
          params={...this.editForm};
          if(this.editId){
            params['sponsorid']=this.editId;
          }
          this.$post('/backend/sponsor/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              if(this.editId){
                this.$message.success('编辑成功');
              }else{
                this.$message.success('添加成功');
              }
              this.editVisible=false;
              this.resetForm();
              this.getData();
            }else{
              this.$message.error(r.message);
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    //导出
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['主办方编号', '会员昵称', '会员手机号', '主办方名称', 'logo','主办方联系方式',"变更时间","状态","主办方简介"];
        const filterVal = ['no','nickName', 'phone', 'sponsorname', 'sponsorurl', 'sponsorphone' ,'updatetime','status','sponsorintro','remark'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][4] = data[i][4]==''?"":this.formatImg(data[i][4]);
          data[i][6] = data[i][6]==0?"0":tool.timeFormat(data[i][6])//变更时间
          data[i][7] = data[i][7]==0?"关闭":'开启'//变更状态
        }
        export_json_to_excel(tHeader, data, '主办方列表excel');
      })
    },
    //
    //根据手机号获取昵称
    getName(){
      if(!(/^1[34578]\d{9}$/.test(this.editForm.phone))){
        return;
      }
      this.$get('/backend/user/getNickName',{
        phone:this.editForm.phone
      }).then(r=>{
        if(r.status==0 && r.data){
          this.editForm.nickName=r.data;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    cellClick(row){
      this.$emit('getItem',row);
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.sponsorList-page{
  .logo{
    width: 60px;
    height:60px;
    border-radius: 50%;
  }
}
</style>
