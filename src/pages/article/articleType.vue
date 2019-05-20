<template>
    <div>
      <div class="search">
        <el-form :inline="true" :model="form" class="demo-form-inline">
          <!--<el-form-item label="分类标记">
            <el-select v-model="form.level" placeholder="分类标记">
              <el-option label="全部" value=""></el-option>
              <el-option label="一级" value="1"></el-option>
              <el-option label="二级" value="2"></el-option>
            </el-select>
          </el-form-item>-->
          <el-form-item label="显示状态">
            <el-select v-model="form.isShow" placeholder="显示状态" @change="getData">
              <el-option label="全部" value=""></el-option>
              <el-option label="是" value="1"></el-option>
              <el-option label="否" value="0"></el-option>
            </el-select>
          </el-form-item>
          <!--<el-form-item label="上级分类">
            <el-input v-model="form.name" placeholder='根据上级分类名字'></el-input>
          </el-form-item>-->
          <el-form-item>
            <el-button type="primary" @click="getData">查询</el-button>
            <el-button type="primary" @click="create">新建</el-button>
            <el-button type='primary' @click='export2Excel'>导出</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="clearfix">
        <el-tree :data="treeTable" :props="defaultProps"></el-tree>
        <div class="table-fr">
          <el-table
            ref="multipleTable"
            :data="tableData"
            v-loading='loading'
            tooltip-effect="dark"
            highlight-current-row
            @selection-change="handleSelectionChange"
            style='display: inline-block;'>
            <el-table-column type="selection" width="60"></el-table-column>
            <el-table-column prop="sortInd" label="显示排序" width="120"></el-table-column>
            <el-table-column prop="title" label="分类名称"></el-table-column>
            <el-table-column prop="isShow" :formatter='formatStatus' label="显示状态"></el-table-column>
            <!--<el-table-column prop="level" :formatter='formatLevel' label="分类标记" width="120"></el-table-column>
            <el-table-column prop="superior_name" label="上级名称" width="120"></el-table-column>-->
            <el-table-column label="更新时间" >
              <template slot-scope="scope">{{!scope.row.updateTime?"无更新时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
            </el-table-column>
            <el-table-column label="操作" width='120' show-overflow-tooltip v-if='editIsShow'>
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click='edit(scope)'>编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div id="page">
            <div class="batch">
              <el-button size="mini" type='danger' :disabled="delItems.length==0" @click="mulDelete">批量删除</el-button>
            </div>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" class='page' :current-page="pageIndex" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper">
            </el-pagination>
          </div>
        </div>
      </div>

      <!-- 编辑文章分类 -->
      <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
        <el-form ref="addForm" :rules="creatRules" :model="editForm" label-width="80px">
          <el-form-item label="分类名称" prop="title">
            <el-input v-model="editForm.title" placeholder='请输入分类名称'></el-input>
          </el-form-item>
          <el-form-item label="显示顺序" prop="sortInd">
            <el-input v-model.number="editForm.sortInd" placeholder='显示顺序'></el-input>
          </el-form-item>
          <el-form-item label="显示状态" prop="isShow">
            <el-select v-model="editForm.isShow" placeholder="显示状态">
              <el-option label="是" value="1"></el-option>
              <el-option label="否" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="addOnSubmit('addForm')">确 定</el-button>
      </span>
      </el-dialog>
    </div>
</template>

<script>
  import tool from '@/vendor/tool'
  export default {
    data(){
      return{
        form:{
          level:'',
          isShow:'',
          name:'',
        },
        treeTable:[],
        defaultProps:{
          children: 'children',
          label: 'label'
        },
        delItems:[],
        toptype:[],
        tableData:[],
        loading:false,
        pageIndex:1,
        pageSize:10,
        total:0,
        editVisible:false,
        editId:null, //编辑的ID，
        dialogTitle:'',
        editIsShow:true,
        editForm:{
          title:'',
          sortInd:'',
          isShow:''
        },
        creatRules:{
          title:[{ required: true, message: '请输入分类名称', trigger: 'blur' }],
          sortInd:[
            { required: true, message: '请输入显示顺序', trigger: 'blur' },
            { type: "number", message: '请输入数字', trigger: 'blur' },
          ],
          isShow:[{ required: true, message: '请选择显示状态', trigger: 'change' }],
        }
      }
    },
    mounted(){
      this.getData();
      this.getTree();
    },
    methods:{
      //获取数据
      getData(){
        this.loading=true
        this.$post('/backend/cmsCategory/getCmsCategory/'+this.pageIndex+'?size='+this.pageSize,{
          pages:this.pageIndex,
          size:this.pageSize,
          isShow:this.form.isShow
        }).then(r=>{
          this.loading=false;
          if(r.returnCode==1){
            this.tableData=r.data;
            this.total=r.sizes;
          }
        }).catch(err=>{
          this.loading=false;
          this.$message.error(err.message);
        })
      },
      //获取全部数据生成tree
      getTree(){
        this.$get('/backend/cmsCategory/typeAll').then(r=>{
          if(r.status==0){
            var list = r.data || [];
            var tree=[];
            var obj={};
            var newList=list.reduce((item,next)=>{
              /*if(item.length==0 && next.title){
                var obj={};
                obj.label=next.title;
                item.push(obj);
              }*/
              if(!obj[next.title]){
                obj[next.title]=true;
                item.push(next);
              }
              return item;
            },[]);
            for(var i=0;i<newList.length;i++){
              let treeObj={};
              if(newList[i].title!=''){
                treeObj['label']=newList[i].title;
                tree.push(treeObj);
              }
            }
            this.treeTable = tree;
          }
        }).catch(err=>{
          this.$message.error(err.message);
        })
      },
      //导出
      export2Excel(){
        require.ensure([], () => {
          const { export_json_to_excel } = require('../../vendor/Export2Excel');
          const tHeader = ['排序','分类名称', '显示状态','更新时间'];
          const filterVal = ['id','title','isShow','updateTime'];
          const list = this.tableData;
          const data = tool.formatJson(filterVal, list);
          for(var i=0;i<data.length;i++){
            data[i][8] = data[i][8]==0?"0":tool.timeFormat(data[i][8]);
          }
//          console.table(data);
          export_json_to_excel(tHeader, data, '文章分类列表excel');
        })
      },
      //改变每页条数
      handleSizeChange(data){
        this.pageSize=data;
        this.getData();
      },
      //分页切换
      handleCurrentChange(data){
        this.pageIndex=data;
        this.getData();
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
        this.$get('/backend/cmsCategory/deleteByIds',{
          ids:idsStr
        }).then(r=>{
          if(r.status==0){
            this.$message({
              showClose:true,
              message:'删除成功',
              type:'success'
            });
            this.getData();
            this.getTree();
          }
        })
      },
      //格式化
      formatStatus(row, column){
        let str='';
        if(row.isShow == 1){
          str='是';
        }
        if(row.isShow == 0){
          str='否';
        }
        return str;
      },
      //新建文章分类
      create(){
        this.editId=null;
        this.editVisible=true;
        this.dialogTitle='新建文章分类';
      },
      //编辑文章分类
      edit(data){
        this.editId=data.row.id;
        this.editVisible=true;
        this.dialogTitle='编辑文章分类';
        this.editForm.title=data.row.title;
        this.editForm.sortInd=data.row.sortInd;
        this.editForm.isShow=typeof data.row.isShow=='number'?data.row.isShow.toString():'';
      },
      //关闭编辑框
      handleClose(){
        this.$confirm('确认关闭？').then(_ => {
          this.editVisible=false;
          this.resetForm();
        }).catch(err=>{
          console.log(err)
        })

      },
      //确认提交
      addOnSubmit(formName){
        this.$refs[formName].validate(valid=>{
          if(valid){
            if(!this.editId){
              //创建分类
              this.$post('/backend/cmsCategory',{
                title:this.editForm.title,
                sortInd:this.editForm.sortInd,
                isShow:this.editForm.isShow
              }).then(r=>{
                if(r.code==200){
                  this.$message.success('创建成功！');
                  this.editVisible=false;
                  this.resetForm();
                  this.getData();
                }else{
                  this.$message.error(r.message);
                }
              })
            }else{
              //编辑分类
              this.$put('/backend/cmsCategory',{
                id:this.editId,
                title:this.editForm.title,
                sortInd:this.editForm.sortInd,
                isShow:this.editForm.isShow
              }).then(r=>{
                if(r.code==200){
                  this.$message.success('编辑成功！');
                  this.editVisible=false;
                  this.resetForm();
                  this.getData();
                }
              })
            }

          }
        })
      },
      //清空表单
      resetForm(){
        this.$refs['addForm'].resetFields();
        this.editForm={
          title:'',
          sortInd:'',
          isShow:''
        };
      },
    }
  }
</script>

<style scoped>
  .el-tree{
    width: 200px;
    float: left;
  }
  .table-fr{
    width: calc(100% - 200px);
    float: left;
  }
</style>
