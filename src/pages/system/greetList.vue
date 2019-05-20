<template>
  <div class="greetList-page">
    <div class="search">
      <el-form ref="form">
        <el-button type="primary" size="small" class="create" @click="create">新建</el-button>
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
      >
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="id" min-width='120' label="显示顺序"> </el-table-column>
        <el-table-column prop="title" min-width="120" label="打招呼名称"></el-table-column>
        <el-table-column prop="content" min-width='200' label="打招呼内容"></el-table-column>
        <el-table-column prop="isShow" :formatter='formatIsDel' min-width='120' label="显示设置"> </el-table-column>
        <el-table-column prop="sortInd" min-width="120" label="显示顺序"></el-table-column>
        <el-table-column min-width="120" label="创建时间">
          <template slot-scope="scope">{{!scope.row.createTime?"暂无创建时间":new Date(scope.row.createTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="操作" min-width='120' show-overflow-tooltip >
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)'>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini" :disabled="delItems.length==0" type='danger' @click="mulDelete">批量删除</el-button>
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
    <!-- 添加图片 -->
    <el-dialog :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="96px">
        <el-form-item label="招呼名称" prop="title">
          <el-input v-model="editForm.title"  placeholder="请输入招呼名称"></el-input>
        </el-form-item>
        <el-form-item label="打招呼内容" prop="content">
          <el-input type="textarea" v-model="editForm.content"  placeholder="请输入招呼名称"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sortInd">
          <el-input v-model.number="editForm.sortInd" placeholder="请输入显示顺序"></el-input>
        </el-form-item>
        <el-form-item label="显示设置" prop="isShow">
          <el-select v-model="editForm.isShow" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
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
  export default {
    data(){
      return {
        tableData: [],
        editForm:{
          title:'',
          isShow:'',
          sortInd:'',
          content:''
        },
        editId:null,
        delItems:[],
        dialogVisible:false,
        options: [{
          value: 1,
          label: '是'
        }, {
          value: 0,
          label: '否'
        }],
        pageIndex:1,
        pageSize:10,
        total:1,
        loading:false,
        rules:{
          title:[{required:true,message:'请输入打招呼名称',trigger:'blur'}],
          isShow:[{required:true,message:'请选择显示设置',trigger:'change'}],
          content:[{required:true,message:'请输入打招呼内容',trigger:'blur'}],
          sortInd:[
            {required:true,message:'请输入显示顺序',trigger:'blur'},
            {type:"number",message:'请输入数字',trigger:'blur'},
          ],
        }
      }
    },
    mounted(){
      this.getData();
    },
    watch:{
      dialogVisible(v){
        if(!v){
          //弹框关闭，清空form表单
          this.resetForm();
        }
      }
    },
    methods:{
      //格式化显示状态
      formatIsDel: function (row, column) {
        return row.isShow == 1 ? '是' : row.isShow == 0 ? '否': '未知';
      },
      //获取数据
      getData(){
        this.loading=true;
        this.$get('/backend/hidata/getHiData/'+this.pageIndex+'?size='+this.pageSize).then(r=>{
          this.loading=false;
          if(r.returnCode==200){
            this.tableData = r.data
            this.total = Number(r.sizes);
          }
        }).catch(err=>{
          this.loading=false;
          this.$message.error(err.message);
        });
      },
      //获取选中的表格信息
      handleSelectionChange(data){
        this.delItems=data;
      },
      //选择删除
      mulDelete(){
        let ids=[];
        for(let i=0;i<this.delItems.length;i++){
          ids.push(this.delItems[i].id);
        }
        var idsStr=ids.join(',');
        this.$get('/backend/hidata/deleteByIds',{
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
      //每页显示条数
      handleSizeChange(val) {
        this.pageSize = val;
        this.getData();
      },
      //切换当前页
      handleCurrentChange(val) {
        this.pageIndex = val;
        this.getData();
      },
      //新增轮播图
      create(){
        this.editId=null;
        this.dialogVisible = true;
      },
      //编辑
      edit(item){
        this.editId=item.row.id;
        this.$get('/backend/hidata?id='+this.editId,{
          id:this.editId
        }).then(r=>{
          if(r.code==200){
            this.dialogVisible = true;
            this.editForm.isShow = r.data.isShow;
            this.editForm.title = r.data.title;
            this.editForm.sortInd = r.data.sortInd;
            this.editForm.content = r.data.content;
          }
        })
      },
      //关闭弹框
      handleClose() {
        this.$confirm('确认关闭？').then(_ => {
          this.dialogVisible=false;
        }).catch(err=>{
          console.log(err)
        })
      },
      //清空表单
      resetForm(){
        this.$refs['editForm'].resetFields();
        this.editForm.title = '';
        this.editForm.sortInd = '';
        this.editForm.content = '';
        this.editForm.isShow = '';
      },
      //提交编辑
      submit(){
        let params={...this.editForm};
        this.$refs['editForm'].validate(valid=>{
          if(valid){
            if(this.editId){
              params['id']=this.editId;
              this.$put('/backend/hidata',params).then(r=>{
                this.$message({
                  message:r.message,
                  type:'success'
                });
                this.dialogVisible=false;
                this.getData();
              })
            }else{
              this.$post('/backend/hidata',params).then(r=>{
                this.$message({
                  message:r.message,
                  type:'success'
                });
                this.dialogVisible=false;
                this.getData();
              })
            }
          }
        })
      },
    }
  }
</script>

<style lang="scss">
  .greetList-page{

  }
</style>
