<template>
  <div class="activationCodeList-page">
    <div class="search">
      <el-form ref="form" :inline="true" :model="form">
        <el-form-item label="会员手机号">
          <el-input v-model="form.phone" placeholder="会员手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
          <!--<el-button type="primary" size="small" @click="create">新建</el-button>-->
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="序号" width="55"></el-table-column>
        <el-table-column prop="nickName" label="会员昵称" ></el-table-column>
        <el-table-column prop="phone" label="会员手机号" ></el-table-column>
        <el-table-column prop="codeNumber" label="总激活码数量" ></el-table-column>
        <el-table-column prop="unextractedNum" label="未提取激活码数量" ></el-table-column>
        <el-table-column prop="readyToUseNum" label="待使用激活码数量" ></el-table-column>
        <el-table-column prop="usedNum" label="已使用激活码数量" ></el-table-column>
        <el-table-column label="获得时间" >
          <template slot-scope="scope">{{scope.row.createTime==0?"无获得时间":new Date(scope.row.createTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="变更时间" >
          <template slot-scope="scope">{{scope.row.updateTime==0?"无变更时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" ></el-table-column>
        <el-table-column label="已提取激活码详情" >
          <template slot-scope="item">
            <router-link :to="{path:'/codeDetail',query:{id:item.row.id}}">
              <el-button size="mini" type="warning">详情</el-button>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="操作" width='150' show-overflow-tooltip>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)' v-if="editIsShow">编辑</el-button>
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
    <!-- 添加激活码 -->
    <!--<el-dialog title="新增激活码" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="addForm" :model="addForm" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="addForm.phone"  @input='getPhone' placeholder='请输入手机号'></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="addForm.name"  placeholder='请输入昵称'></el-input>
        </el-form-item>
        <el-form-item label="激活码数">
          <el-input v-model="addForm.nums" placeholder='请输入激活码数量'></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="addForm.remark" placeholder='请输入备注'></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOnSubmit">确 定</el-button>
      </span>
    </el-dialog>-->
    <!-- 编辑激活码 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="120px">
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" placeholder='请输入手机号' disabled></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickName"  placeholder='请输入昵称' disabled></el-input>
        </el-form-item>
        <el-form-item label="待使用激活码数量" class="long-label" prop="unextractedNum">
          <el-input v-model.number="editForm.unextractedNum" placeholder='请输入激活码数量'></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="editForm.remark" placeholder='请输入备注'></el-input>
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
  name: 'activationCodeList',
  data () {
    var validateNumber=(rule,value,callback)=>{
      if(!/^-?[1-9]\d*$/g.test(value)){
        callback(new Error('请输入整数'))
      }else{
        callback();
      }
    };
    return {
      tableData: [],
      form: {
        phone:''
      },
      editId:null,
      editTitle:'',
      editForm:{
        phone:'',
        nickName:'',
        unextractedNum:'',
        remark:'',
      },
      rules:{
        unextractedNum:[
          {required:true,message:'请输入待使用激活码数量',trigger:'blur'},
          {validator:validateNumber, trigger:'blur'}
        ],
      },
      delItems:[],
      editVisible:false,
      pageIndex:1,
      total:1,
      pageSize:10,
      loading:false,
    }
  },
  computed:{
    editIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    }
  },
  mounted(){
    this.getData();
  },
  methods:{
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/userCode/list',{
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
      this.$get('/backend/userCode/deleteByIds',{
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
    //编辑
    edit(item){
      this.editVisible = true;
      this.editTitle='编辑激活码';
      this.editId = item.row.id;
      this.editForm.phone = item.row.phone;
      this.editForm.nickName = item.row.nickName;
      this.editForm.unextractedNum = item.row.unextractedNum;
      this.editForm.remark = item.row.remark;
    },
    //关闭弹框
    handleClose() {
      this.$confirm('确认关闭？').then(_ => {
        this.resetForm();
        this.editVisible=false;
      }).catch(_ => {});
    },
    //清空表单
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editId = null;
      this.editForm.phone = '';
      this.editForm.nickName = '';
      this.editForm.unextractedNum = '';
      this.editForm.remark = '';
    },
    //提交编辑内容
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          var params={...this.editForm};
          if(this.editId){
            params['id']=this.editId;
          }
          this.$post('/backend/userCode/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              if(this.editId){
                this.$message.success('编辑成功');
              }/*else{
                this.$message.success('添加成功');
              }*/
              this.editVisible=false;
              this.resetForm();
              this.getData();
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
        const tHeader = ['会员昵称', '会员手机号', '总激活码数量', '未提取激活码数量', '待使用激活码数量','已使用激活码数量',"获得时间","变更时间","备注"];
        const filterVal = ['nickName', 'phone', 'codeNumber', 'unextractedNum', 'readyToUseNum' ,'usedNum','createTime','updateTime','remark'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][6] = data[i][6]==0?"0":tool.timeFormat(data[i][6])//变更时间
          data[i][7] = data[i][7]==0?"0":tool.timeFormat(data[i][7])//变更时间
        }
        export_json_to_excel(tHeader, data, '激活码列表excel');
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .activationCodeList-page{
    .long-label{
      .el-form-item__label{
        line-height:20px;
      }
    }
  }
</style>
