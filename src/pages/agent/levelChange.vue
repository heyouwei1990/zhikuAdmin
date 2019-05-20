<template>
  <div>
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="手机号码" >
          <el-input v-model="form.phone" placeholder="手机号码"  @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="审核状态" >
          <el-select v-model="form.status">
            <el-option label="全部" value=""></el-option>
            <el-option label="待审核" value="0"></el-option>
            <el-option label="已审核" value="1"></el-option>
            <el-option label="已拒绝" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="id" width="80" label="序号"></el-table-column>
        <el-table-column prop="nickName" width="120" label="会员昵称"></el-table-column>
        <el-table-column prop="phone" width="110" label="会员手机号"></el-table-column>
        <el-table-column prop="newAgentName" width="120" label="变后代理级别"></el-table-column>
        <el-table-column prop="newAgentArea" width="120" label="变后代理地区"></el-table-column>
        <el-table-column prop="agentLevelName" width="120" label="变前代理级别"></el-table-column>
        <el-table-column prop="agentArea" width="120" label="变前代理地区"></el-table-column>
        <el-table-column width="120" label="变更时间">
          <template slot-scope="scope">{{scope.row.addTime==0?"":new Date(scope.row.addTime*1000).format("yyyy-MM-dd hh-mm")}}</template>
        </el-table-column>
        <el-table-column prop="addAdminName" width="80" label="变更人"></el-table-column>
        <el-table-column prop="agentStatus" :formatter='formatStatus' width="80" label="审核状态"></el-table-column>
        <el-table-column prop="name" width="120" label="审核时间">
          <template slot-scope="scope">{{scope.row.updateTime==0?"":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="updateAdminName" width="80" label="审核人"></el-table-column>
        <el-table-column prop="updateRemark" min-width="80" label="备注"></el-table-column>
        <el-table-column label="操作" width="150" show-overflow-tooltip>
          <template slot-scope="item">
            <el-button size="mini" type="primary" v-if='item.row.status == 0' @click='toAudit(item)'>审核</el-button>
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
    <el-dialog title="审核" :visible.sync="auditVisible" width="30%" :before-close="handleClose">
      <el-form ref="auditForm" :rules="rules" :model="auditForm" label-width="80px">
        <el-form-item label="审核状态" prop="status">
          <el-select v-model="auditForm.status">
            <el-option label="审核通过" value="1"></el-option>
            <el-option label="拒绝" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="updateRemark">
          <el-input type="textarea" v-model="auditForm.updateRemark"></el-input>
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
  name: 'levelChange',
  data () {
    var validateRemark=(rule,value,callback)=>{
      if(this.auditForm.status==2 && value.trim()==''){
        callback(new Error('请输入原因'))
      }else{
        callback();
      }
    }
    return {
      tableData: [],
      form: {
        phone: '',
        status:''
      },
      auditForm:{
        status:"1",
        updateRemark:"",
        id:""
      },
      rules:{
        updateRemark:[{validator:validateRemark, tigger:'blur'}]
      },
      stateOptions: [{
        value: '',
        label: '全部'
      }, {
        value: '0',
        label: '正常'
      }, {
        value: '1',
        label: '锁定'
      }],
      delItems:[],
      auditVisible:false,
      pageIndex:1,
      total:1,
      pageSize:10
    }
  },
  mounted(){
    this.getData()
  },
  methods:{//状态
    formatStatus(row, column) {
      return row.status == 0 ? '待审核' : row.status == 1 ? '审核通过' : row.status == 2 ? '拒绝' : '未知';
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/agent/agentAuditList',{
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
      this.$get('/backend/agent/deleteAgentByIds',{
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
    //去审核
    toAudit(item){
      this.auditVisible = true;
      this.auditForm.id = item.row.id;
    },
    //提交审核
    submit(){
      this.$refs['auditForm'].validate(valid=>{
        if(valid){
          this.$post('/backend/agent/updateAgentAudit',{
            ...this.auditForm
          }).then(r=>{
            if(r.status==0){
              this.$message.success('审核成功');
              this.getData();
              this.resetForm();
              this.auditVisible=false;
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    //关闭弹框
    handleClose(done) {
      this.$confirm('确认关闭？').then(_ => {
        this.resetForm();
        this.auditVisible=false;
      }).catch(_ => {});
    },
    //清空表单
    resetForm(){
      this.$refs['auditForm'].resetFields();
      this.auditForm.id='';
      this.auditForm.status='';
      this.auditForm.updateRemark='';
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
