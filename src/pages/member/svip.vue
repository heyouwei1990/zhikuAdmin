<template>
  <div>
    <div class="search">
      <el-form ref="filterForm" :inline="true" :model="filterForm">
        <el-form-item label="主办方名称">
          <el-input v-model="filterForm.sponsorName" placeholder="" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="主办方编号">
          <el-input v-model="filterForm.sponsorNo" placeholder=""  @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
          <el-button type="primary" size="small" class='create' @click="add">新建会员会议权限</el-button>
          <el-button type="primary" size="small" @click="export2Excel">导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        v-loading='loading'
        tooltip-effect="dark"
        style="width: 100%"
        highlight-current-row
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="id" label="序号"> </el-table-column>
        <el-table-column prop="sponsorName" label="主办方名称"> </el-table-column>
        <el-table-column prop="sponsorNo" label="主办方编号"> </el-table-column>
        <el-table-column prop="level" label="会议权限等级"> </el-table-column>
        <el-table-column prop="orderId" label="来源订单号"> </el-table-column>
        <el-table-column label="获得时间">
          <template slot-scope="scope">{{new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <!--<el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type='primary' @click='edit(scope)'>编辑</el-button>
          </template>
        </el-table-column>-->
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

    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="closeEdit">
      <el-form ref="editForm" :model="editForm" label-width="100px">
        <el-row>
          <el-col :span='20'>
            <el-form-item label="主办方编号">
              <el-input v-model="editForm.sponsorNo" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span='3' :offset='1'>
            <el-button size="small" style='margin-top:4px;' type='primary' @click='chooseVisible = true'>选择</el-button>
          </el-col>
        </el-row>
        <el-form-item label="主办方名称">
          <el-input v-model="editForm.sponsorName" disabled></el-input>
        </el-form-item>
        <el-form-item label="权限等级">
          <el-select v-model="editForm.level" placeholder="请选择权限等级">
            <el-option label="一级" value="1"></el-option>
            <el-option label="二级" value="2"></el-option>
            <el-option label="三级" value="3"></el-option>
            <el-option label="四级" value="4"></el-option>
            <el-option label="五级" value="5"></el-option>
            <el-option label="六级" value="6"></el-option>
            <el-option label="七级" value="7"></el-option>
            <el-option label="八级" value="8"></el-option>
            <el-option label="九级" value="9"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="来源订单号">
          <el-input v-model="editForm.orderId" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeEdit">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 主办方 -->
    <el-dialog  title="选择主办方"  :visible.sync="chooseVisible" width="80%"  :before-close="handleClose">
      <sponsor @getItem="ievent3" :isComponent="true"></sponsor>
      <span slot="footer" class="dialog-footer">
        <el-button @click="chooseVisible = false">取 消</el-button>
        <el-button type="primary" @click="chooseVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!--<el-dialog title="编辑主办方会议权限" :visible.sync="dialogVisible3" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :model="editForm" label-width="100px">
        <el-row>
          <el-col :span='20'>
            <el-form-item label="主办方编号">
              <el-input v-model="editForm.sponsor_no" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span='3' :offset='1'>
            <el-button size="small" style='margin-top:4px;' type='primary' @click='dialogVisible4 = true'>选择</el-button>
          </el-col>
        </el-row>
        <el-form-item label="主办方名称">
          <el-input v-model="editForm.sponsor_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="权限等级">
          <el-select v-model="editForm.level" placeholder="请选择权限等级">
            <el-option label="一级" value="1"></el-option>
            <el-option label="二级" value="2"></el-option>
            <el-option label="三级" value="3"></el-option>
            <el-option label="四级" value="4"></el-option>
            <el-option label="五级" value="5"></el-option>
            <el-option label="六级" value="6"></el-option>
            <el-option label="七级" value="7"></el-option>
            <el-option label="八级" value="8"></el-option>
            <el-option label="九级" value="9"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="来源订单号">
          <el-input v-model="editForm.order_id" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible3 = false">取 消</el-button>
        <el-button type="primary" @click="editBtn">确 定</el-button>
      </span>
    </el-dialog>-->
    <!-- 主办方 -->
    <!--<el-dialog  title="选择讲师"  :visible.sync="dialogVisible4" width="80%"  :before-close="handleClose">
      <sponsor @ievent3="ievent3"></sponsor>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible4 = false">取 消</el-button>
        <el-button type="primary" @click="sponsorBtn">确 定</el-button>
      </span>
    </el-dialog>-->

  </div>
</template>

<script>
  import sponsor from '@/pages/sponsor/sponsorList'
  import tool from '@/vendor/tool'
export default {
  name: 'authList',
  components:{
    sponsor
  },
  data () {
    return {
      tableData: [],
      filterForm: {
        sponsorName: '',
        sponsorNo:''
      },
      uid:"",
      pageIndex:1,
      pageSize:10,
      editVisible:false,
      chooseVisible:false,
      total:1,
      loading:false,
      delItems:[],
      editId:null,
      editTitle:'',
      editForm:{
        sponsorName: '',
        level:'1',
        sponsorNo:'',
        orderId:'99',
        userAuthId:''
      },
      sponsorData:'',
    }
  },
  mounted(){
    this.uid = this.$route.query.id;
    this.getData();
    this.editForm.userAuthId = this.$route.query.id;
  },
  methods:{
    //会员等级
    formatLevel: function (row, column) {
      return row.level == 0 ? '普通会员' : row.level == 1 ? 'VIP':row.level == 2 ? '弟子合伙人'  : row.level == 3 ? '创业':row.level == 4 ? '院长' : '未知';
    },
    //获取列表
    getData(){
      this.loading=true;
      this.$get('/backend/user/userSponVipList',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        userAuthId:this.uid,
        sponsorNo:this.filterForm.sponsorNo,
        sponsorName:this.filterForm.sponsorName,
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
    //选中的条数
    handleSelectionChange(data){
      this.delItems=data;
    },
    //删除
    mulDelete(){
      let ids=[];
      for(let i=0;i<this.delItems.length;i++){
        ids.push(this.delItems[i].id);
      }
      var idsStr=ids.join(',');
      this.$get('/backend/user/userSponVipDeleteByIds',{
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
    //添加
    add(){
      this.editTitle='添加主办方会议权限';
      this.editId=null;
      this.editVisible=true;
    },
    //编辑
    edit(data){
      this.editTitle='编辑主办方会议权限';
      this.editForm.sponsorName=data.row.sponsorName;
      this.editForm.level=data.row.level+'';
      this.editForm.sponsorNo=data.row.sponsorNo;
      this.editForm.orderId=data.row.orderId;
      this.editId=data.row.id;
      this.editVisible=true;
    },
    //选择主办方
    ievent3(data){
      this.editForm.sponsorNo=data.no;
      this.editForm.sponsorName=data.sponsorname;
      //this.sponsorData = data;
    },
    //关闭编辑框
    closeEdit(){
      this.$confirm('确认关闭？').then(_ => {
        this.resetForm();
        this.editVisible=false;
      }).catch(_ => {});
    },
    //清空编辑框
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editForm.sponsorName='';
      this.editForm.level='1';
      this.editForm.sponsorNo='';
      this.editForm.orderId='';
    },
    handleClose(done) {
      this.$confirm('确认关闭？').then(_ => {
        done();
      }).catch(_ => {});
    },

    //提交编辑、添加框
    submit(){
      let params={...this.editForm};
      if(this.editId){
        params['id']=this.editId;
      }
      this.$post('/backend/user/userSponVipInsertOrUpdate',params).then(r=>{
        if(r.status==0){
          if(this.editId){
            this.$message.success('修改成功');
          }else{
            this.$message.success('添加成功');
          }
          this.getData();
          this.resetForm();
          this.editVisible=false;
        }else{
          this.$message.error(r.message);
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //导出表格
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['序号', '主办方名称', '主办方编号', '会议权限等级', '来源订单号','获得时间'];
        const filterVal = ['id', 'sponsorName', 'sponsorNo', 'level', 'orderId' ,'addTime'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][5] = !data[i][5]?"0":tool.timeFormat(data[i][5])//获得时间
        }
        export_json_to_excel(tHeader, data, '会员会议权限列表excel');
      })
    },

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
