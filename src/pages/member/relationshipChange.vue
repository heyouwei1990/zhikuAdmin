<template>
  <div class="relationshipChange-page">
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="会员手机号">
          <el-input v-model="form.phone" placeholder="会员手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="form.status" >
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in auditStatus" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item >
          <el-button type="primary" size="small" @click="getData">查询</el-button>
          <el-button type='primary' size='small' class='create' @click='export2Excel'>导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        highlight-current-row
        v-loading='loading'
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="id" label="序号" width='55'> </el-table-column>
        <el-table-column prop="nickName" label="会员昵称"> </el-table-column>
        <el-table-column prop="phone" label="会员手机号"> </el-table-column>
        <el-table-column prop="newReferreruserName" label="现推荐人姓名"> </el-table-column>
        <el-table-column prop="newReferreruserPhone" label="现推荐人手机号"> </el-table-column>
        <el-table-column prop="referreruserName" label="原推荐人姓名"> </el-table-column>
        <el-table-column prop="referreruserPhone" label="原推荐人手机号"> </el-table-column>
        <el-table-column label="变更级别时间">
          <template slot-scope="scope">{{scope.row.updateTime==0?"无变更时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="addAdminName" label="变更人"></el-table-column>
        <el-table-column prop="status" :formatter='formatStatus' label="审核状态"></el-table-column>
        <el-table-column label="审核时间">
          <template slot-scope="scope">{{scope.row.updateTime==0?"":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
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
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"> </el-pagination>
    </div>
    <el-dialog :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="auditForm" :rules="rules" :model="auditForm" label-width="80px">
        <el-form-item label="审核状态">
          <el-select v-model="auditForm.status" >
            <el-option label="审核通过" value="1"> </el-option>
            <el-option label="不通过" value="2"> </el-option>
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
  name: 'relationshipChange',
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
        phone:"",
        status:''
      },
      dialogVisible:false,
      auditStatus:[
        {
          value: '0',
          label: '待审核'
        },{
          value: '1',
          label: '已审核'
        }, {
          value: '2',
          label: '未通过'
        }
      ],
      auditForm:{
        status:"1",
        updateRemark:"",
        id:""
      },
      rules:{
        updateRemark:[{validator:validateRemark, tigger:'blur'}]
      },
      delItems:[],
      pageIndex:1,
      total:0,
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
    //状态显示转换
    formatStatus(row, column) {
      return row.status == 0 ? '未审核' : row.status == 1 ? '审核通过' : row.status == 2 ? '未通过' : '未知';
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/user/ReApplyList',{
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
        this.loading=true;
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
    //关闭弹框
    handleClose(done) {
      this.$confirm('确认关闭？')
      .then(_ => {
        this.resetForm();
        this.dialogVisible=false;
      })
      .catch(_ => {});
    },
    //清空表单
    resetForm(){
      this.$refs['auditForm'].resetFields();
      this.auditForm.id = '';
      this.auditForm.status = '';
      this.auditForm.updateRemark = '';
    },
    //审核
    toAudit(item){
      this.dialogVisible = true;
      this.auditForm.id = item.row.id;
    },
    //提交审核
    submit(){
      this.$refs['auditForm'].validate(valid=>{
        if(valid){
          this.$post('/backend/user/updateReApplyById',{
            ...this.auditForm
          }).then(r=>{
            if(r.status==0){
              this.$message.success('审核成功');
              this.resetForm();
              this.dialogVisible=false;
              this.getData();
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
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
      this.$get('/backend/user/deleteReApplyByIds',{
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
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['会员昵称','会员手机号', '现推荐人姓名', '现推荐人手机号', '原推荐人姓名', '原推荐人手机号', '变更级别时间', '变更人', '审核状态', '审核时间','审核人','备注'];
        const filterVal = ['nickName','phone', 'newReferreruserName', 'newReferreruserPhone', 'referreruserName', 'referreruserPhone', 'updateTime', 'addAdminName', 'status', 'updateAdmdinName','updateRemark'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i=0;i<data.length;i++){
          data[i][6] = data[i][6]==0?"0":tool.timeFormat(data[i][6]);
          data[i][8] = data[i][8] == 0 ? '未审核' : data[i][8] == 1 ? '审核通过' : data[i][8] == 2 ? '未通过' : '未知';
        }
        export_json_to_excel(tHeader, data, '关系变更excel');
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
