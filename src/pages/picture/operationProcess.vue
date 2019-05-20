<template>
  <div class="operationProcess-page">
    <div class="search">
      <el-form ref="form">
        <el-button type="primary" size="small" class='create' @click='create' v-if="addIsShow">新建</el-button>
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
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="60"></el-table-column>
        <el-table-column prop="id" width='100' label="编号"> </el-table-column>
        <el-table-column prop="name" width='120' label="操作手册名称"> </el-table-column>
        <el-table-column width='150' label="icon图片">
          <template slot-scope="scope">
            <img v-if="scope.row.ico" :src="formatImg(scope.row.ico)" class="avatar">
          </template>
        </el-table-column>
        <el-table-column prop="sequence" width='120' label="显示顺序"> </el-table-column>
        <el-table-column width='150' label="详情预览">
          <template slot-scope="scope">
            <a :href="formatImg(scope.row.detail)" target="blank">
              <img v-if="scope.row.detail" :src="formatImg(scope.row.detail)" class="img">
            </a>
          </template>
        </el-table-column>
        <el-table-column min-width="120" label="更新时间">
          <template slot-scope="scope">
            {{scope.row.updateTime==0?"无更新时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" show-overflow-tooltip>
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
    <!-- 新建操作手册 -->
    <!--<el-dialog title="新建操作手册" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="操作手册名称">
          <el-input v-model="form.name" placeholder="请输入轮播图名称"></el-input>
        </el-form-item>
        <el-form-item label="icon图片">
          <uploadImg :type='types' @ievent="ievent"></uploadImg>
        </el-form-item>
        <el-form-item label="显示顺序">
          <el-input v-model="form.sequence" placeholder="显示顺序"></el-input>
        </el-form-item>
         <el-form-item label="详情图片">
          <uploadImg :type='types' @ievent="ievent2"></uploadImg>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addBtn">确 定</el-button>
      </span>
    </el-dialog>-->
    <!-- 编辑操作手册 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="editRule" :model="editForm" label-width="120px">
        <el-form-item label="操作手册名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入轮播图名称"></el-input>
        </el-form-item>
        <el-form-item label="icon图片" prop="ico">
          <uploader
            :fileName="fileName"
            @success="fileIco"
            @remove="removeIco"
            :image="icoUrl"
          ></uploader>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sequence">
          <el-input v-model.number="editForm.sequence" placeholder="显示顺序"></el-input>
        </el-form-item>
         <el-form-item label="详情图片" prop="detail">
           <uploader
             :fileName="fileName"
             @success="fileDetail"
             @remove="removeDetail"
             :image="detailUrl"
           ></uploader>
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
  import axios from 'axios';
  import qs from 'qs'
  import uploader from '@/components/uploader'
  import { imgUrl } from '../../../config/common';
  import tool from '@/vendor/tool'
export default {
  name: 'operationProcess',
  components:{
    uploader
  },
  data () {
    var validateNumber=(rule,value,callback)=>{
      if(!/^[1-9]\d*$/g.test(value)){
        callback(new Error('请输入正整数'))
      }else{
        callback();
      }
    };
    return {
      tableData: [],
      editId:null,
      editTitle:'',//编辑/新建弹框标题
      editForm: {
        name: '',
        ico: '',
        sequence: '',
        detail: ''
      },
      editRule:{
        name:[{required:true,message:'请输入操作手册名称',trigger:'blur'}],
        //ico:[{required:true,message:'请上传操作手册图标',trigger:'blur'}],
        sequence:[
          {required:true, message:'请输入显示顺序', trigger:'blur'},
          {validator:validateNumber, trigger:'blur'}
        ],
        //detail:[{required:true,message:'请上传操作手册',trigger:'blur'}],
      },
      icoUrl:'',//预览图
      detailUrl:'',//预览图
      fileName:'instructions',//上传到哪个文件夹
      delItems:[],
      editVisible:false,
      pageIndex:1,
      pageSize:10,
      total:0,
      loading:false,
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
      this.$get('/backend/OperationProcess/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize
      }).then(r=>{
        this.loading=false;
        if(r.status==0){
          var list=r.data;
          /*for(let i=0;i<list.length;i++){
            list[i].ico=!list[i].ico?'':tool.imgBaseUrl+'/'+list[i].ico;
            list[i].detail=!list[i].detail?'':tool.imgBaseUrl+'/'+list[i].detail;
          }*/
          this.tableData=list;
          this.total=r.total;
        }
      }).catch(err=>{
        this.$message.error(err.message);
        this.loading=false;
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
      this.$get('/backend/OperationProcess/deleteByIds',{
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
    //页面条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData()
    },
    //切换当前页
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData();
    },
    //创建
    create(){
      this.editTitle='新建操作手册';
      this.editId=null;
      this.editVisible=true;
    },
    //编辑
    edit(item){
      this.editTitle='编辑操作手册';
      this.editId=item.row.id;
      this.editForm.name=item.row.name;
      this.editForm.ico=item.row.ico;
      this.editForm.sequence=item.row.sequence;
      this.editForm.detail=item.row.detail;
      this.icoUrl=this.formatImg(item.row.ico);
      this.detailUrl=this.formatImg(item.row.detail);
      this.editVisible=true;

    },
    //提交编辑内容
    submit(){
      var params={};
      params={...this.editForm};
      if(this.editId){
        params['id']=this.editId;
      }
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          this.$post('/backend/OperationProcess/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              if(this.editId){
                this.$message.success('编辑成功');
              }else{
                this.$message.success('添加成功');
              }
              this.editVisible=false;
              this.resetForm();
              this.getData();
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    //ico上传成功
    fileIco(data){
      this.editForm.ico=data.response.result;
      this.icoUrl=tool.imgBaseUrl+'/'+data.response.result;
    },
    //删除ico图片
    removeIco(){
      this.editForm.ico='';
      this.icoUrl='';
    },
    //detail上传成功
    fileDetail(data){
      this.editForm.detail=data.response.result;
      this.detailUrl=tool.imgBaseUrl+'/'+data.response.result;
    },
    //删除detail图片
    removeDetail(){
      this.editForm.detail='';
      this.detailUrl='';
    },
    //关闭弹窗
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.resetForm();
          this.editVisible=false;
        })
        .catch(_ => {});
    },
    //清空表单
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editForm.name='';
      this.editForm.ico='';
      this.editForm.sequence='';
      this.editForm.detail='';
      this.icoUrl='';
      this.detailUrl='';
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .operationProcess-page{
    .avatar{
      width: 65px;
      height:65px;
    }
    .img{
      width: 100px;
      height:50px;
    }
  }
</style>
