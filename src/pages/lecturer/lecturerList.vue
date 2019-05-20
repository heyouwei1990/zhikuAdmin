<template>
  <div class="lecturerList-page">
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="会员手机号">
          <el-input v-model="form.phone" placeholder="会员手机号"  @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="讲师名称">
          <el-input v-model="form.lecturerName" placeholder="讲师名称" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" @change="getData">
            <el-option label="全部" value=""></el-option>
            <el-option label="关闭" value="0"></el-option>
            <el-option label="开启" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
          <el-button type="primary" size="small" v-show="!isComponent" @click='export2Excel'>导出</el-button>
          <el-button type="primary" size="small" v-show="!isComponent" class='create' @click="create" v-if="addIsShow">新建讲师</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        v-loading='loading'
        highlight-current-row
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @cell-click="cellClick"
      >
        <el-table-column type="selection" width="40" v-if="!isComponent"> </el-table-column>
        <el-table-column prop="id" label="序号" > </el-table-column>
        <el-table-column prop="nickName" label="会员昵称" min-width="100"> </el-table-column>
        <el-table-column prop="phone" label="会员手机号" min-width="120"> </el-table-column>
        <el-table-column prop="lecturerName" label="讲师姓名" min-width="100"> </el-table-column>
        <el-table-column label="讲师头像" width="120">
          <template slot-scope='scope'>
            <img class="avatar" v-if="scope.row.lecturerPicture" :src="formatImg(scope.row.lecturerPicture)" >
          </template>
        </el-table-column>
        <el-table-column prop="lecturerDetails" label="讲师简介" min-width="140"> </el-table-column>
        <el-table-column label="变更时间" min-width="100" v-once>
          <template slot-scope="scope" v-once>{{scope.row.updateTime==0?"无变更时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="80">
          <template slot-scope="scope">{{ scope.row.status==1?"开启":"关闭" }}</template>
        </el-table-column>
        <el-table-column label="操作" width='80' show-overflow-tooltip  v-if="!isComponent">
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
        :total="total">
      </el-pagination>
    </div>
    <!-- 修改讲师 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" :disabled="editId>0" @blur="getName"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="editForm.nickName" disabled></el-input>
        </el-form-item>
        <el-form-item label="讲师姓名" prop="lecturerName">
          <el-input v-model="editForm.lecturerName" max-length="10" placeholder="限制十个字"></el-input>
        </el-form-item>
        <el-form-item label="头像" prop="lecturerPicture">
          <uploader
            :fileName="fileName"
            @success="filePic"
            @remove="removePic"
            :image="avatarUrl"
          ></uploader>
        </el-form-item>
        <el-form-item label="讲师详情" prop="lecturerDetails">
          <el-input type="textarea" autosize v-model="editForm.lecturerDetails"></el-input>
        </el-form-item>
        <el-form-item label="讲师状态" prop="status">
          <el-select v-model="editForm.status" >
            <el-option label="开启" value="1"> </el-option>
            <el-option label="关闭" value="0"> </el-option>
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
  name: 'lecturerList',
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
      tableData: [],
      form:{
        phone:'',
        name:'',
        status:''
      },
      fileName:'lecturer',
      avatarUrl:'',
      editId:null,
      editTitle:'',
      editForm: {
        phone: '',
        nickName: '',
        lecturerName: '',
        lecturerPicture: '',
        lecturerDetails: '',
        status: '1',
      },
      rules:{
        phone:[
          {required:true,message:'请输入手机号',trigger:'blur'},
          {validator:validatePhone, trigger:'blur'}
        ],
        lecturerName:[{required:true,message:'请输入讲师姓名',trigger:'blur'}],
        lecturerPicture:[{required:true,message:'请上传讲师照片',trigger:'blur'}],
        lecturerDetails:[{required:true,message:'请输入讲师详情',trigger:'blur'}],
        status:[{required:true,message:'请选择讲师状态',trigger:'blur'}],
      },
      delItems:[],
      editVisible:false,
      pageIndex:1,
      total:0,
      pageSize:10,
      loading:false
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
      this.$get('/backend/lecturer/list',{
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
      this.$get('/backend/lecturer/deleteByIds',{
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
      this.editTitle='新建讲师';
      this.editId=null;
      this.editVisible=true;
    },
    //编辑
    edit(item){
      this.editTitle='编辑讲师';
      this.editId=item.row.id;
      this.editForm.phone = item.row.phone;
      this.editForm.nickName = item.row.nickName;
      this.editForm.lecturerName = item.row.lecturerName;
      this.editForm.lecturerDetails = item.row.lecturerDetails;
      this.editForm.status = item.row.status+'';
      this.editForm.lecturerPicture = item.row.lecturerPicture;
      this.avatarUrl=this.formatImg(item.row.lecturerPicture);
      this.editVisible=true;
    },
    //上传
    filePic(data){
      this.editForm.lecturerPicture=data.response.result;
      this.avatarUrl=tool.imgBaseUrl+'/'+data.response.result;
    },
    //删除
    removePic(){
      this.editForm.lecturerPicture='';
      this.avatarUrl='';
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
      this.editForm.lecturerName = '';
      this.editForm.lecturerDetails = '';
      this.editForm.status = '';
      this.editForm.lecturerPicture = '';
      this.avatarUrl='';
    },
    //提交编辑表单
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          var params={};
          params={...this.editForm};
          if(this.editId){
            params['id']=this.editId;
          }
          this.$post('/backend/lecturer/insertOrUpdate',params).then(r=>{
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
        const tHeader = ['序号', '会员昵称', '会员手机号', '讲师姓名', '讲师简介','变更时间','状态'];
        const filterVal = ['id', 'nickName', 'phone', 'lecturerName', 'lecturerDetails','updateTime','status'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i=0;i<data.length;i++){
          data[i][5] = data[i][5]==0?"0":tool.timeFormat(data[i][5])
          data[i][6] = data[i][6] == 1 ? "开启" : "关闭";
        }
        export_json_to_excel(tHeader, data, '讲师列表excel');
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
    //点击选中讲师
    cellClick(row, column, cell, event){
      this.$emit('getItem',row);
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .lecturerList-page{
    .avatar{
      width: 100%;
      height:auto;
      max-height: 200px;
      max-width: 300px;
    }
  }
</style>

