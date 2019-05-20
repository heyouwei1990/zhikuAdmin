<template>
  <div>
    <div class="search">
      <el-form ref="form">
        <el-button type="primary" size="small" class='create' @click="create" v-if='addIsShow'>新建</el-button>
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
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="id" min-width='100' label="编号"> </el-table-column>
        <el-table-column prop="phone" min-width='150' label="图片">
          <template slot-scope="scope">
            <img v-if="scope.row.bannerurl" :src="formatImg(scope.row.bannerurl)" class="img">
          </template>
        </el-table-column>
        <el-table-column prop="isDel" :formatter='formatIsDel' width='120' label="显示状态"> </el-table-column>
        <el-table-column prop="link" min-width='120' label="链接地址"> </el-table-column>
        <el-table-column prop="sequence" min-width="120" label="显示顺序"></el-table-column>
        <el-table-column label="操作" min-width='120' show-overflow-tooltip v-if='editIsShow'>
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
        :total="total"> </el-pagination>
    </div>
    <!-- 添加图片 -->
    <!--<el-dialog title="添加图片" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="图片">
          <uploadImg :type='type' @ievent="ievent"></uploadImg>
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input v-model="addForm.banner_meetingid" placeholder="请输入链接地址"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序">
          <el-input v-model="addForm.sequence"  placeholder="请输入显示顺序"></el-input>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="addForm.is_del" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addPic">确 定</el-button>
      </span>
    </el-dialog>-->
    <!-- 编辑图片 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="100px">
        <el-form-item label="轮播图名称" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入轮播图名称"></el-input>
        </el-form-item>
        <el-form-item label="图片" prop="bannerurl">
          <uploader
            :fileName="fileName"
            @success="filePic"
            @remove="removePic"
            :image="bannerUrl"
          ></uploader>
        </el-form-item>
        <el-form-item label="链接地址" prop="link">
          <el-input v-model="editForm.link" placeholder="请输入链接地址"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sequence">
          <el-input v-model="editForm.sequence"  placeholder="请输入显示顺序"></el-input>
        </el-form-item>
        <el-form-item label="显示状态" prop="isDel">
          <el-select v-model="editForm.isDel" placeholder="请选择">
            <el-option label="是" value="0"> </el-option>
            <el-option label="否" value="1"> </el-option>
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
  import uploader from '@/components/uploader'
  import tool from '@/vendor/tool';
export default {
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
      type:1,
      fileName:'idxBanner',
      bannerUrl:'',
      tableData: [],
      editId:null,
      editTitle:'',
      editForm:{
        title:'',
        link:"",
        bannerurl:"",
        sequence:"",
        isDel:"0"
      },
      rules:{
        title:[{required:true,message:'请输入轮播图名称',trigger:'blur'}],
        link:[{required:true,message:'请输入链接地址',trigger:'blur'}],
        bannerurl:[{required:true,message:'请上传图片',trigger:'blur'}],
        sequence:[
          {required:true,message:'请输入显示顺序',trigger:'blur'},
          {validator:validateNumber, trigger:'blur'}
        ],
        isDel:[{required:true,message:'请输入显示状态',trigger:'blur'}],
      },
      delItems:[],
      editVisible:false,
      pageIndex:1,
      pageSize:10,
      total:0,
      loading:false
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
    formatIsDel: function (row, column) {
      return row.is_del == 0 ? '是' : row.is_del == 1 ? '否': '未知';
    },
    //补全表格图片路径
    formatImg(url){
      return url?tool.imgBaseUrl+'/'+url:'';
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/banner/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        type:this.type,
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
      this.$get('/backend/banner/deleteByIds',{
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
      this.editTitle='添加图片';
      this.editId=null;
      this.editVisible=true;
    },
    //编辑
    edit(item){
      this.editTitle='编辑图片';
      this.editId=item.row.id;
      this.editForm.title = item.row.title;
      this.editForm.link = item.row.link;
      this.editForm.bannerurl = item.row.bannerurl;
      this.editForm.sequence = item.row.sequence;
      this.editForm.isDel = item.row.isDel+'';
      this.bannerUrl=this.formatImg(item.row.bannerurl);
      this.editVisible=true;
    },
    //上传
    filePic(data){
      this.editForm.bannerurl=data.response.result;
      this.bannerUrl=tool.imgBaseUrl+'/'+data.response.result;
    },
    //删除
    removePic(){
      this.editForm.bannerurl='';
      this.bannerUrl='';
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
      this.editForm.title = '';
      this.editForm.link = '';
      this.editForm.bannerurl = '';
      this.editForm.sequence = '';
      this.editForm.isDel = '0';
      this.bannerUrl='';
    },
    //提交编辑表单
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          var params={};
          params={...this.editForm};
          params['type']=this.type;
          if(this.editId){
            params['id']=this.editId;
          }
          this.$post('/backend/banner/insertOrUpdate',params).then(r=>{
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
    width: 100px;
    height: 50px;
  }
</style>
