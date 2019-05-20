<template>
  <div class="menuList-page">
    <el-table
      ref="multipleTable"
      :data="tableData"
      v-loading="loading"
      highlight-current-row
      tooltip-effect="dark"
      @selection-change="handleSelectionChange"
      style="width: 100%">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" label="菜单名称"> </el-table-column>
      <el-table-column prop="icon" label="菜单图标"></el-table-column>
      <el-table-column prop="status" :formatter='formatStatus' label="状态"> </el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">{{scope.row.addTime==0?"无":new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
      </el-table-column>
      <el-table-column label="更新时间">
        <template slot-scope="scope">{{scope.row.updateTime==0?"无":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
      </el-table-column>
      <el-table-column prop="menuAciton" label="对象ID"> </el-table-column>
      <el-table-column prop="showButton" :formatter='formatShowButton' label="按钮是否显示"> </el-table-column>
      <el-table-column prop="actionId" label="API"> </el-table-column>
      <el-table-column label="操作" width='80' show-overflow-tooltip>
        <template slot-scope="item">
          <el-button size="mini" type="primary" @click='edit(item)'>编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
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
    <el-dialog title="编辑菜单" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="80px">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入菜单名称"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="editForm.icon" placeholder='请输入菜单图标'></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" >
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否链接" prop="islink">
          <el-select v-model="editForm.islink" >
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="显示按钮" prop="showButton">
          <el-select v-model="editForm.showButton" >
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="ordery">
          <el-input v-model="editForm.ordery" placeholder="请输入排序"></el-input>
        </el-form-item>
        <el-form-item label="对象ID" prop="menuAciton">
          <el-input v-model="editForm.menuAciton" placeholder="请输入对象ID"></el-input>
        </el-form-item>
        <el-form-item label="API" prop="actionId">
          <el-input v-model="editForm.actionId" placeholder="请输入API"></el-input>
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
  data () {
    return {
      tableData: [],
      editVisible:false,
      pageIndex:1,
      pageSize:10,
      total:0,
      loading: false,
      delItems:[],
      editId:null,
      editForm:{
        name:'',
        icon:'',
        status:'',
        islink:'',
        ordery:'',
        menuAciton:'',
        actionId:'',
        showButton:''
      },
      rules:{
        name:[{required:true,message:'请输入菜单名称',trigger:'blur'}],
        status:[{required:true,message:'请选择状态',trigger:'blur'}],
        islink:[{required:true,message:'请选择是否链接',trigger:'blur'}],
        showButton:[{required:true,message:'请选择是否显示按钮',trigger:'blur'}],
        ordery:[{required:true,message:'请输入排序',trigger:'blur'}],
        menuAciton:[{required:true,message:'请输入对象ID',trigger:'blur'}],
        actionId:[{required:true,message:'请输入API',trigger:'blur'}],
      }
    }
  },
  mounted:function(){
    this.getData();
  },
  methods:{//状态显示转换
    formatStatus(row, column) {
      return row.status == 1 ? '显示' : row.status == 0 ? '不显示' : '未知';
    },
    formatShowButton(row,column){
      return row.showButton == 1 ? '显示' : row.showButton == 0 ? '不显示' : '未知';
    },
    getData(){
      this.loading=true;
      this.$get('/backend/adminMenu/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize
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
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData();
    },
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData()
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
      this.$get('/backend/adminMenu/deleteByIds',{
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
    handleClose(done) {
      this.$confirm('确认关闭？').then(_ => {
        this.resetForm();
        this.editVisible=false;
      }).catch(_ => {});
    },
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editId=null;
      this.editForm.name='';
      this.editForm.icon='';
      this.editForm.status='';
      this.editForm.islink='';
      this.editForm.ordery='';
      this.editForm.menuAciton='';
      this.editForm.actionId='';
      this.editForm.showButton='';
    },
    //编辑
    edit(item){
      this.editTitle='编辑菜单';
      this.editId=item.row.id;
      this.editForm.name = item.row.name;
      this.editForm.icon = item.row.icon;
      this.editForm.status = item.row.status+'';
      this.editForm.islink = item.row.islink+'';
      this.editForm.ordery = item.row.ordery;
      this.editForm.menuAciton = item.row.menuAciton;
      this.editForm.actionId = item.row.actionId;
      this.editForm.showButton = item.row.showButton+'';
      this.editVisible=true;
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
          this.$post('/backend/adminMenu/insertOrUpdate',params).then(r=>{
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
<style lang="scss">
  .menuList-page{

  }
</style>
