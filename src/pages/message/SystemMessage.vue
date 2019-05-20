<template>
  <div>
    <div class="search">
      <el-form ref="form"  :inline="true">
        <el-button type="primary" size="small" class='create' @click="create" v-show='addIsShow'>新建</el-button>
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
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column prop="id" label="序号" width="120"> </el-table-column>
        <el-table-column prop="title" label="消息标题" width="120"> </el-table-column>
        <el-table-column prop="name" label="创建时间" width="120">
          <template slot-scope="scope">{{new Date(scope.row.createTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="isDel" :formatter='formatIsDel' label="显示状态" width="120"></el-table-column>
        <el-table-column  prop="addAdminName" label="发布人"  width="120"></el-table-column>
        <el-table-column prop="content" label="消息内容" min-width="120"> </el-table-column>
        <el-table-column label="操作" width="120" show-overflow-tooltip v-if='editIsShow'>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)'>编辑</el-button>
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
    <!--<el-dialog title="新建系统消息" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="消息标题">
          <el-input v-model="form.title" placeholder='请输入消息标题'></el-input>
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input type="textarea" v-model="form.content" placeholder='请输入消息内容'></el-input>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="form.is_del" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addSystemMessage">确 定</el-button>
      </span>
    </el-dialog>-->

    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="80px">
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="editForm.title" placeholder='请输入消息标题'></el-input>
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input type="textarea" v-model="editForm.content" max-length="400" placeholder='请输入消息内容'></el-input>
        </el-form-item>
        <el-form-item label="显示状态" prop="isDel">
          <el-select v-model="editForm.isDel" placeholder="请选择">
            <el-option label="是" value="0"></el-option>
            <el-option label="否" value="1"></el-option>
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
export default {
  name: 'systemMessage',
  data () {
    return {
      type:0, //0是系统消息，1是用户消息
      tableData: [],
      editId:null,
      editTitle:'',
      editForm: {
        title: '',
        content: '',
        isDel: '0'
      },
      rules:{
        title:[{required:true, message:'请输入消息标题',trigger:'blur'}],
        content:[{required:true, message:'请输入消息内容',trigger:'blur'}],
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
    formatIsDel(row, column) {
      return row.isDel == 0 ? '是' : row.isDel == 1 ? '否' : '未知';
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/message/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        type:this.type,
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
      this.$get('/backend/message/deleteByIds',{
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
    handleClose(done) {
      this.$confirm('确认关闭？').then(_ => {
        this.resetForm();
        this.editVisible=false;
      }).catch(_ => {});
    },
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editForm.title='';
      this.editForm.content='';
      this.editForm.isDel='0';
    },
    //创建
    create(){
      this.editTitle='新建系统消息';
      this.editId=null;
      this.editVisible=true;
    },
    //编辑
    edit(item){
      this.editTitle='编辑系统消息';
      this.editId=item.row.id;
      this.editForm.title=item.row.title;
      this.editForm.content=item.row.content;
      this.editForm.isDel=item.row.isDel+'';
      this.editVisible=true;
    },
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          var params={...this.editForm};
          params['type']=this.type;
          if(this.editId){
            params['id']=this.editId;
          }
          this.$post('/backend/message/insertOrUpdate',params).then(r=>{
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
  }
</style>
