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
        <el-table-column type="selection" width="60"> </el-table-column>
        <el-table-column prop="id" width='100' label="编号"> </el-table-column>
        <el-table-column prop="phone" width='150' label="图片">
          <template slot-scope="scope">
            <img v-if="scope.row.bannerurl" :src="formatImg(scope.row.bannerurl)" class="img">
          </template>
        </el-table-column>
        <el-table-column prop="isDel" :formatter='formatIsDel' width='120' label="显示状态"> </el-table-column>
        <el-table-column prop="bannerMeetingid" width='120' label="链接地址"> </el-table-column>
        <el-table-column prop="sequence" width="120" label="显示顺序"></el-table-column>
        <el-table-column label="操作" min-width='120' show-overflow-tooltip  v-if='editIsShow'>
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
    <!-- 编辑图片 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="80px">
        <el-form-item label="图片" prop="bannerurl">
          <uploader
            :fileName="fileName"
            @success="filePic"
            @remove="removePic"
            :image="imgUrl"
          ></uploader>
        </el-form-item>
        <el-form-item label="链接地址" prop="bannerMeetingid">
          <el-input v-model="editForm.bannerMeetingid" placeholder="请输入链接地址"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sequence">
          <el-input v-model.number="editForm.sequence"  placeholder="请输入显示顺序"></el-input>
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
  name: 'lecturerList',
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
      fileName:'ziku',
      imgUrl:'',
      tableData: [],
      editId:null,
      editTitle:'',
      editForm:{
        bannerMeetingid:"",
        bannerurl:"",
        sequence:"",
        isDel:"0",
        type:2, //2为资库轮播
      },
      rules:{
        bannerurl:[{required:true, message:'请上传图片',trigger:'blur'}],
        bannerMeetingid:[{required:true, message:'请输入链接',trigger:'blur'}],
        sequence:[
          {required:true, message:'请输入显示顺序',trigger:'blur'},
          {validator:validateNumber, trigger:'blur'}
        ],
        isDel:[{required:true, message:'请选择显示状态',trigger:'blur'}],
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
    //补全表格图片路径
    formatImg(url){
      return url?tool.imgBaseUrl+'/'+url:'';
    },
    formatIsDel: function (row, column) {
      return row.isDel == 0 ? '是' : row.isDel == 1 ? '否': '未知';
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/banner/list',{
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
    create(){
      this.editTitle='添加图片';
      this.editId=null;
      this.editVisible=true;
    },
    edit(item){
      this.editTitle='编辑图片';
      this.editId=item.row.id;
      this.editForm.bannerMeetingid=item.row.bannerMeetingid;
      this.editForm.bannerurl=item.row.bannerurl;
      this.editForm.sequence=item.row.sequence;
      this.editForm.isDel=item.row.isDel+'';
      this.imgUrl=this.formatImg(item.row.bannerurl);
      this.editVisible=true;
    },
    handleClose(done) {
      this.$confirm('确认关闭？').then(_ => {
        this.resetForm();
        this.editVisible=false;
      }).catch(_ => {});
    },
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editForm.bannerMeetingid='';
      this.editForm.bannerurl='';
      this.editForm.sequence='';
      this.editForm.isDel='0';
      this.imgUrl='';
    },
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          var params={...this.editForm};
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
              this.getData();
              this.resetForm();
              this.editVisible=false;
            }else{
              this.$message.error(r.message);
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    //上传
    filePic(data){
      this.editForm.bannerurl=data.response.result;
      this.imgUrl=tool.imgBaseUrl+'/'+data.response.result;
    },
    //删除
    removePic(){
      this.editForm.bannerurl='';
      this.imgUrl='';
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  img.img{
    width: 100px;
    height: 50px;
  }
</style>
