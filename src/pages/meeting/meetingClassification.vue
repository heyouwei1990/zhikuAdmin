<template>
  <div class="meetingType-page">
    <div class="search">
      <el-form ref="form">
        <el-form-item>
          <el-button type="primary" size="mini" class='create' @click='export2Excel'>导出</el-button>
          <el-button type="primary" size="mini" class='create' @click="create" v-show='addIsShow'>新建</el-button>
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
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="60"> </el-table-column>
        <el-table-column prop="sequence" width='100' label="显示排序"> </el-table-column>
        <el-table-column prop="typename" width='120' label="会议分类"> </el-table-column>
        <el-table-column width='120' label="图标">
          <template slot-scope="scope">
            <img v-if="scope.row.iconurl" :src="formatImg(scope.row.iconurl)" class="icon">
          </template>
        </el-table-column>
        <el-table-column prop="status" width='100' label="状态">
          <template slot-scope='scope'>
            {{scope.row.status==1?"是":"否"}}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" min-width="120" label="更新时间">
          <template slot-scope="scope">{{!scope.row.updateTime?"无变更时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" show-overflow-tooltip>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)' v-show='editIsShow'>编辑</el-button>
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
    <!-- 新建分类 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="80px">
        <el-form-item label="分类名称" prop="typename">
          <el-input v-model="editForm.typename" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="分类图标" prop="iconurl">
          <uploader
            :fileName="fileName"
            @success="filePic"
            @remove="removePic"
            :image="iconUrl"
          ></uploader>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sequence">
          <el-input v-model.number="editForm.sequence" placeholder='请输入显示顺序'></el-input>
        </el-form-item>
        <el-form-item label="显示状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择">
            <el-option label="是" value="1"> </el-option>
            <el-option label="否" value="0"> </el-option>
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
      fileName:"meetingTypeUrl",
      iconUrl:'',
      tableData: [],
      delItems:[],
      editVisible:false,
      options: [{
        value: '1',
        label: '是'
      }, {
        value: '2',
        label: '否'
      }],
      pageIndex:1,
      total:0,
      pageSize:10,
      editId:null,
      editTitle:'',
      editForm:{
        typename:"",
        iconurl:"",
        sequence:"",
        status:""
      },
      rules:{
        typename:[{required:true, message:'请输入分类名称', trigger:'blur'}],
        iconurl:[{required:true, message:'请上传分类图标', trigger:'blur'}],
        sequence:[
          {required:true, message:'请输入显示顺序', trigger:'blur'},
          {validator:validateNumber, trigger:'blur'}
        ],
        status:[{required:true, message:'请选择显示状态', trigger:'blur'}]
      },
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
    //this.getStorage();
  },
  methods:{
    //补全表格图片路径
    formatImg(url){
      return url?tool.imgBaseUrl+'/'+url:'';
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/meeting/typeList',{
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
        ids.push(this.delItems[i].meetingtypeid);
      }
      var idsStr=ids.join(',');
      this.$get('/backend/meeting/deleteByTypeIds',{
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
      this.editTitle='新建分类';
      this.editId=null;
      this.editVisible=true;
    },
    //编辑
    edit(item){
      this.editTitle='编辑分类';
      this.editId=item.row.meetingtypeid;
      this.editForm.typename = item.row.typename;
      this.editForm.sequence = item.row.sequence;
      this.editForm.status = item.row.status+'';
      this.editForm.iconurl = item.row.iconurl;
      this.iconUrl=this.formatImg(item.row.iconurl);
      this.editVisible=true;
    },
    //上传
    filePic(data){
      this.editForm.iconurl=data.response.result;
      this.iconUrl=tool.imgBaseUrl+'/'+data.response.result;
    },
    //删除
    removePic(){
      this.editForm.iconurl='';
      this.iconUrl='';
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
      this.editForm.typename = '';
      this.editForm.sequence = '';
      this.editForm.status = '';
      this.editForm.iconurl = '';
      this.iconUrl='';
    },
    //提交编辑表单
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          var params={};
          params={...this.editForm};
          if(this.editId){
            params['meetingtypeid']=this.editId;
          }
          this.$post('/backend/meeting/insertOrUpdateType',params).then(r=>{
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
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['显示顺序','会议分类', '状态', '更新时间'];
        const filterVal = ['sequence','typename', 'status', 'updateTime'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i=0;i<data.length;i++){
          data[i][2] = data[i][2] == 1?"是":"否"
          data[i][3] = data[i][3]==0?"0":tool.timeFormat(data[i][3])
        }
        export_json_to_excel(tHeader, data, '会议分类excel');
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .meetingType-page{
    .icon{
      display: block;
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
  }
</style>
