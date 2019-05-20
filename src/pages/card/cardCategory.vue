<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <el-form-item label="分类标记">
          <el-select v-model="form.level" placeholder="分类标记">
            <el-option label="全部" value=""></el-option>
            <el-option label="一级" value="1"></el-option>
            <el-option label="二级" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="form.status" placeholder="显示状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="是" value="0"></el-option>
            <el-option label="否" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder='分类名称'></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getData">查询</el-button>
          <el-button type="primary" @click="create" v-if="addIsShow">新建</el-button>
          <el-button type="primary" @click="export2Excel">导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-tree :data="treeTable" :props="defaultProps" @node-click="treeFilter"></el-tree>
      <div class="table">
        <el-table
          ref="multipleTable"
          :data="tableData"
          v-loading='loading'
          tooltip-effect="dark"
          highlight-current-row
          @selection-change="handleSelectionChange"
          style='display: inline-block;'
        >
          <el-table-column type="selection" width="60"></el-table-column>
          <el-table-column prop="level" :formatter='formatLevel' label="分类标记" width="120"></el-table-column>
          <el-table-column prop="name" label="分类名称" width="120"></el-table-column>
          <el-table-column prop="superiorName" label="上级名称" width="120"></el-table-column>
          <el-table-column prop="sequence" label="显示排序" width="120"></el-table-column>
          <el-table-column prop="status" :formatter='formatStatus' label="显示状态" width="120"></el-table-column>
          <el-table-column label="更新时间"  min-width="120">
            <template slot-scope="scope">{{scope.row.updateTime==0?"无更新时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
          </el-table-column>
          <el-table-column label="操作" width='120' show-overflow-tooltip>
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click='edit(scope)' v-if="editIsShow">编辑</el-button>
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
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
    <!-- 编辑资库名片分类 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="editRule" :model="editForm" label-width="80px">
        <el-form-item label="分类标记" prop="level">
          <el-select v-model="editForm.level" placeholder="分类标记" @change='getLevel'>
            <el-option label="一级" value="1"></el-option>
            <el-option label="二级" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editForm.name" placeholder='请输入分类名称'></el-input>
        </el-form-item>
        <el-form-item label="上级分类" prop="superiorId">
          <el-select v-model="editForm.superiorId" placeholder="上级分类" :disabled='editForm.level==0?true:false'>
            <el-option :label="item.name" :value="item.id" :key='item.id'  v-for='item in toptype'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sequence">
          <el-input v-model.number="editForm.sequence" placeholder='显示顺序'></el-input>
        </el-form-item>
        <el-form-item label="显示状态" prop="status">
          <el-select v-model="editForm.status" placeholder="显示状态">
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
  name: 'cardCategory',
  components:{

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
      form: {
        status: '',
        level:'',
        name:''
      },
      editTitle:'',
      editId:null,
      editForm:{
        level:'',
        name:'',
        superiorId:'',
        sequence:'',
        status:''
      },
      editRule:{
        level:[{required:true, message:'请选择分类标记', trigger: 'blur'}],
        name:[{required:true, message:'请输入分类名称', trigger: 'blur'}],
        superiorId:[{required:true, message:'请选择上级分类', trigger: 'blur'}],
        sequence:[
          {required:true, message:'请输入显示顺序', trigger:'blur'},
          {validator:validateNumber, trigger:'blur'}
        ],
        status:[{required:true, message:'请选择显示状态', trigger: 'blur'}],
      },
      pageIndex:1,
      total:0,
      pageSize:10,
      editVisible:false,
      loading:false,
      treeTable:[],
      delItems:[],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      toptype:[],
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
    this.getTree();
  },
  methods:{
    //格式化状态
    formatStatus(row, column) {
      return row.status == 0 ? '是' : row.status == 1 ? '否' : '未知';
    },
    //格式化等级
    formatLevel(row, column) {
      return row.level == 0 ? '平台' : row.level == 1 ? '一级' : row.level == 2 ? '二级' : '未知';
    },
    //多选
    handleSelectionChange(data){
      this.delItems=data;
    },
    //删除表格多选项
    mulDelete(){
      let ids=[];
      for(let i=0;i<this.delItems.length;i++){
        ids.push(this.delItems[i].id);
      }
      var idsStr=ids.join(',');
      this.$get('/backend/userCardType/deleteByIds',{
        ids:idsStr
      }).then(r=>{
        if(r.status==0){
          this.$message({
            showClose:true,
            message:'删除成功',
            type:'success'
          });
          this.getData();
          this.getAll();
        }
      })
    },
    //更改每页条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData()
    },
    //切换当前页
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData()
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
    //获取表格数据
    getData(){
      this.loading=true;
      this.$get('/backend/userCardType/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
          ...this.form
      }).then(r=>{
        this.loading=false;
        if(r.status==0){

          this.tableData = r.data;
          this.total=r.total;
        }
      }).catch(err=>{
        this.loading=false;
        this.$message.error(err.message);
      });
    },
    treeFilter(data){
      /*this.form.name=data.label;
      this.getData();*/
    },
    //获取全部数据生成tree
    getTree(){
      this.$get('/backend/userCardType/typeAll').then(r=>{
        if(r.status==0){
          var list = r.data;
          var secondLevel = [];
          var fristLevel = [];
          if(list) {
            for (var i = 0; i < list.length; i++) {
              if (list[i]['level'] == 1) {//一级
                var obj = {
                  label: list[i]['name'],
                  id: list[i]['id'],
                  children: []
                }
                fristLevel.push(obj);
              } else {
                var obj = {
                  label: list[i]['name'],
                  id: list[i]['id'],
                  superiorId: list[i]['superiorId'],
                  children: []
                }
                secondLevel.push(obj);
              }
            }
            for (var k = 0; k < secondLevel.length; k++) {
              for (var z = 0; z < fristLevel.length; z++) {
                if (secondLevel[k]['superiorId'] == fristLevel[z]['id']) {
                  fristLevel[z]['children'].push(secondLevel[k])
                }
              }
            }
          }
          this.treeTable = fristLevel;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //编辑
    edit(item){
      this.editTitle='编辑资库名片分类';
      this.getLevel(item.row.level);
      this.editId=item.row.id;
      this.editForm.level = item.row.level+'';
      this.editForm.name = item.row.name;
      this.editForm.superiorId = item.row.superiorId+'';
      this.editForm.sequence = item.row.sequence;
      this.editForm.status = item.row.status+'';
      this.editVisible = true;
    },
    //创建
    create(){
      this.editId=null;
      this.editTitle='新建资库名片分类';
      this.editVisible = true;
    },
    //清空表单
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editForm.level = '';
      this.editForm.name = '';
      this.editForm.superiorId = '';
      this.editForm.sequence = '';
      this.editForm.status = '';
    },
    //提交编辑内容
    submit(){
      let params={...this.editForm};
      if(this.editId){
        params['id']=this.editId;
      }
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          this.$post('/backend/userCardType/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              if(this.editId){
                this.$message.success('编辑成功');
              }else {
                this.$message.success('新建成功');
              }
              this.editVisible = false;
              this.getData();
              this.getTree();
              this.resetForm();
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },

    //获取上级分类
    gettoptype(){
      this.$get('/backend/userCardType/getTypeByLevel').then(r=>{
        if(r.status==0){
          this.toptype = r.data;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //获取上级分类
    getLevel(data){
      this.toptype = [];
      if(data == 2){
        //二级
        this.gettoptype();
        this.editForm.superiorId = "";
      }else{
        //一级
        var platform = {
          addTime:"1532683195",
          id:"0",
          level:"1",
          name:"平台",
          sequence:"2",
          status:"0",
          superiorId:"0",
          updateTime:"0"
        }
        this.editForm.superiorId = "0";
        this.toptype.push(platform);
      }
    },
    //导出
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['分类标记', '分类名称', '上级分类', '显示排序', '显示状态','更新时间'];
        const filterVal = ['level', 'name', 'superiorName', 'sequence', 'status' ,'updateTime'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][0] = data[i][0] == 0? '平台' : data[i][0] == 1 ? '一级' : data[i][0] == 2 ? '二级' : '未知';
          data[i][4] = data[i][4]==0 ? '是' : data[i][4] == 1 ? '否' : '未知';
          data[i][5] = data[i][5]==0?"0":tool.timeFormat(data[i][5])//更新时间
        }
        export_json_to_excel(tHeader, data, '资库名片分类excel');
      })
    },
    /*getStorage(){
      var rules = window.sessionStorage.getItem("rules");
      if(rules == '*'){
        this.addIsShow = true;
        this.editIsShow = true;
        return;
      }
      var menuList = JSON.parse(window.sessionStorage.getItem("menuList"));
      for(var i = 0;i < menuList.length;i++){
        if(rules.indexOf(menuList[i]['id'])!=-1){
          if(menuList[i]['action_id']=='usercard/addtype'){
            if(menuList[i]['show_button']==1){
              this.addIsShow = true;
            }else{
              this.addIsShow = false;
            }
          }
          if(menuList[i]['action_id']=='usercard/updatetype'){
            if(menuList[i]['show_button']==1){
              this.editIsShow = true;
            }else{
              this.editIsShow = false;
            }
          }
        }
      }
    },*/
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
  img{
    width: 60px;
    height: 60px;
    border-radius: 50%
  }
  .el-tree{
    width: 200px;
    display: inline-block;
    float: left;
  }
  .el-table{
    width: calc(100% - 200px);
    display: inline-block;
  }
  #page{
    width: calc(100% - 200px);
    margin-left: 200px;
  }
</style>
