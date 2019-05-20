<template>
  <div>
    <div class="search">
      <el-form ref="form" :model="form" :inline="true">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" ></el-input>
        </el-form-item>
        <el-form-item label="提现状态">
          <el-select v-model="form.isSucceed" placeholder="请选择" class='select'>
            <el-option label="全部" value=""></el-option>
            <el-option label="提现中" value="0"></el-option>
            <el-option label="提现成功" value="1"></el-option>
            <el-option label="提现失败" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click='getData'>搜索</el-button>
          <el-button type="primary" size="small" class='create' @click='export2Excel'>导出</el-button>
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
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="序号" width="120"></el-table-column>
        <el-table-column prop="nickName" label="会员昵称" width="120"></el-table-column>
        <el-table-column prop="phone" label="会员手机号" width="120"></el-table-column>
        <el-table-column prop="realName" label="真实姓名" width="120"></el-table-column>
        <el-table-column prop="bankName" label="银行名称" width="120"></el-table-column>
        <el-table-column prop="bankCardNo" label="银行卡号" width="120"></el-table-column>
        <el-table-column prop="withdrawPrice" label="提现金额" width="120"></el-table-column>
        <el-table-column prop="arrivalPrice" label="到账金额" width="120"></el-table-column>
        <el-table-column label="提现时间" width="120">
          <template slot-scope="scope">{{scope.row.createtime==0?"无":new Date(scope.row.createtime*1000).format("yyyy-MM-dd hh:mm:ss")}}</template>
        </el-table-column>
        <el-table-column prop="name" label="到账时间" width="120">
          <template slot-scope="scope">{{scope.row.succeedTime==0?"无":new Date(scope.row.succeedTime*1000).format("yyyy-MM-dd hh:mm:ss")}}</template>
        </el-table-column>
        <el-table-column prop="isSucceed" :formatter='formatIsSuccess' label="提现状态" width="120"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120"></el-table-column>
        <el-table-column label="操作" show-overflow-tooltip>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='audit(item)' v-if='item.row.isSucceed==0' v-show='editIsShow'>审核</el-button>
            <el-button size="mini" type="primary" v-else disabled v-show='editIsShow'>已审核</el-button>
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
    <el-dialog  title="提现审核"  :visible.sync="dialogVisible" width="30%"  :before-close="handleClose">
      <el-form ref="auditForm" :rules="rules" :model="auditForm" label-width="80px">
        <el-form-item label="提现状态" prop="isSucceed">
          <el-select v-model="auditForm.isSucceed" placeholder="请选择" class='select' >
            <el-option label="提现中" value="0"></el-option>
            <el-option label="提现成功" value="1"></el-option>
            <el-option label="提现失败" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="auditForm.remark" placeholder='请输入推送内容'></el-input>
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
  name: 'record',
  data () {
    var validateRemark=(rule,value,callback)=>{
      if(this.auditForm.isSucceed==2 && value.trim()==''){
        callback(new Error('请输入原因'))
      }else{
        callback();
      }
    };
    return {
      tableData: [],
      form: {
        phone: '',
        isSucceed:''
      },
      auditForm:{
        isSucceed:'0',
        remark:'',
        id:''
      },
      rules:{
        isSucceed:[{required:true,message:'请选择提现状态',trigger:'blur'}],
        remark:[{validator:validateRemark,trigger:'blur'}],
      },
      dialogVisible:false,
      delItems:[],
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
  },
  mounted(){
    this.getData();
    this.getStorage();
  },
  methods:{
    formatIsSuccess: function (row, column) {
      return row.isSucceed == 0 ? '提现中' : row.isSucceed == 1 ? '提现成功' : row.isSucceed == 2 ? '提现失败' : '其他';
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/withdrawDeposit/list',{
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
      this.$get('/backend/withdrawDeposit/deleteByIds',{
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
    audit(item){
      this.auditForm.id = item.row.id;
      this.dialogVisible = true;
    },
    resetForm(){
      this.$refs['auditForm'].resetFields();
      this.auditForm.id='';
      this.auditForm.isSucceed='0';
      this.auditForm.remark='';
    },
    handleClose(done) {
      this.$confirm('确认关闭？').then(_ => {
        this.dialogVisible = false;
        this.resetForm();
      }).catch(_ => {});
    },
    submit(){
      this.$refs['auditForm'].validate(valid=>{
        if(valid){
          let params={...this.auditForm};
          this.$post('/backend/withdrawDeposit/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              this.$message.success(r.message);
              this.getData();
              this.resetForm();
              this.dialogVisible = false;
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    getStorage(){
      var rules = window.sessionStorage.getItem("rules");
      if(rules == '*'){
        this.editIsShow = true;
        return;
      }
      var menuList = JSON.parse(window.sessionStorage.getItem("menuList"));
      for(var i = 0;i < menuList.length;i++){
        if(rules.indexOf(menuList[i]['id'])!=-1){
          if(menuList[i]['action_id']=='withdrawdeposit/update'){
            if(menuList[i]['show_button']==1){
              this.editIsShow = true;
            }else{
              this.editIsShow = false;
            }
          }
        }
      }
    },
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['会员昵称', '会员手机号', '真实姓名', '银行名称', '银行卡号','提现金额','到账金额','提现时间','到账时间','提现状态','备注'];
        const filterVal = ['nickName', 'phone', 'realName', 'bankName', 'bankCardNo','withdrawPrice','arrivalPrice','createtime','succeedTime','isSucceed','remark'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i=0;i<data.length;i++){
          data[i][7] = tool.timeFormat(data[i][7]);
          data[i][8] = tool.timeFormat(data[i][8]);
          data[i][9] = data[i][9]== 0 ? '提现中' : data[i][9] == 1 ? '提现成功' : data[i][9] == 2 ? '提现失败' : '其他';
        }
        export_json_to_excel(tHeader, data, '提现记录excel');
      })
    }
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
