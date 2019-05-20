<template>
  <div>
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="会员手机号" >
          <el-input v-model="form.phone" placeholder="请输入会员手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="会员手机号" >
          <el-select v-model="form.status">
            <el-option v-for="item in auditStatus" :key="item.value" :label="item.label" :value="item.value"> </el-option>
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
        v-loading='loading'>
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="id" width='60' label="序号"> </el-table-column>
        <el-table-column prop="nickName" label="会员昵称"> </el-table-column>
        <el-table-column prop="phone" label="会员手机号"> </el-table-column>
        <el-table-column prop="newLevel" label="变更后级别" :formatter='formatNewLevel'> </el-table-column>
        <el-table-column prop="level" label="变更前级别" :formatter='formatLevel'> </el-table-column>
        <el-table-column prop="name" label="变更时间">
          <template slot-scope="scope">{{new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="addAdminName" label="变更人"></el-table-column>
        <el-table-column prop="status" label="审核状态" :formatter='formStatus'> </el-table-column>
        <el-table-column prop="name" label="审核时间">
          <template slot-scope="scope">{{scope.row.updateTime==0?"无审核时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="updateAdminName" label="审核人"> </el-table-column>
        <el-table-column prop="updateRemark" label="备注"> </el-table-column>
        <el-table-column label="操作" width='80' show-overflow-tooltip v-if="isShow">
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='toAudit(item)' v-if='item.row.status==0'>审核</el-button>
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
    <el-dialog :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="auditForm" :rules="rules" :model="auditForm" label-width="80px">
        <el-form-item label="审核状态">
          <el-select v-model="auditForm.status" >
            <el-option label="已审核" value="1"> </el-option>
            <el-option label="已拒绝" value="2"> </el-option>
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
  name: 'mLevelChange',
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
      value:"全部",
      auditStatus: [{
        value: '',
        label: '全部'
      }, {
        value: 0,
        label: '待审核'
      }, {
        value: 1,
        label: '已审核'
      }, {
        value: 2,
        label: '已拒绝'
      }],
      delItems:[],
      dialogVisible:false,
      auditForm:{
        status:"1",
        updateRemark:"",
        id:''
      },
      rules:{
        updateRemark:[{validator:validateRemark, tigger:'blur'}]
      },
      pageIndex:1,
      total:1,
      loading:false,
      pageSize:10,
    }
  },
  computed:{
    isShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
  },
  mounted(){
    this.getData();
  },
  methods:{
    formatLevel: function (row, column) {
      return this.transferLevel(row.level);
    },
    formatNewLevel: function (row, column) {
      return this.transferLevel(row.newLevel);
    },
    transferLevel(data){
      var level='';
      switch (parseInt(data)){
        case 0:
          level='普通会员';
          break;
        case 1:
          level='VIP';
          break;
        case 2:
          level='弟子合伙人';
          break;
        case 3:
          level='创业';
          break;
        case 4:
          level='院长';
          break;
        default:
          level='未知';
      }
      return level;
    },
    formStatus:function (row,column){
      return row.status == 1 ? '通过' :row.status == 2 ? '拒绝' : '未审核'
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/user/auditList',{
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
      this.$get('/backend/user/deleteAuditByIds',{
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
      this.dialogVisible = true;
      this.auditForm.id = item.row.id;
    },
    //提交审核
    submit(){
      this.$refs['auditForm'].validate(valid=>{
        if(valid){
          this.$post('/backend/user/updateAudit',{
            ...this.auditForm
          }).then(r=>{
            if(r.status==0){
              this.$message.success('审核成功');
              this.getData();
              this.resetForm();
              this.dialogVisible=false;
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
        this.dialogVisible=false;
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
