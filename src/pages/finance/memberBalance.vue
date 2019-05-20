<template>
  <div>
    <div class="search">
      <el-form ref="form" :model="form" :inline="true">
        <el-form-item label="会员昵称">
          <el-input v-model="form.nickName" placeholder="请输入会员昵称" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item >
          <el-button type="primary" size="small" @click="getData">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        highlight-current-row
        v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="序号" width="120"></el-table-column>
        <el-table-column prop="name" label="会员昵称" width="120"> </el-table-column>
        <el-table-column prop="phone" label="会员手机号" width="120"> </el-table-column>
        <el-table-column prop="name" label="已提现余额" width="120">
          <template slot-scope="scope">{{ scope.row.date }}</template>
        </el-table-column>
        <el-table-column prop="address" label="可提现余额" min-width="120"> </el-table-column>
        <el-table-column prop="name" label="提现余额" width="120"></el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini"  v-if='delAll'>批量删除</el-button>
        <el-button size="mini" disabled v-else>批量删除</el-button>
      </div>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" class='page' :current-page="page" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog title="" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="推送标题">
          <el-input v-model="form.name" placeholder='请输入推送标题'></el-input>
        </el-form-item>
        <el-form-item label="推送内容">
          <el-input type="textarea" v-model="form.desc" placeholder='请输入推送内容'></el-input>
        </el-form-item>
        <el-form-item label="推送人群">
          <el-select v-model="value" placeholder="请选择">
            <el-option  v-for="item in options" :key="item.value"  :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'lecturerList',
  components:{

  },
  data () {
    return {
      tableData: [{
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        phone:'18538296599'
      }],
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      value:"钻石会员",
      options: [{
        value: '所有人',
        label: '所有人'
      }, {
        value: '普通会员',
        label: '普通会员'
      }, {
        value: '黄金会员',
        label: '黄金会员'
      }, {
        value: '钻石会员',
        label: '钻石会员'
      }, {
        value: '代理商',
        label: '代理商'
      }],
      delAll:false,
      dialogVisible:false,
      page:1,
      pageSize:20,
      total:1
    }
  },
  mounted(){

  },
  methods:{
    handleSelectionChange(e){
      // console.log(e)
    },
    select(e){
      var len = e.length;
      if(len){
        this.delAll = true
      }else{
        this.delAll = false
      }
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },
    onSubmit(){

    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    del(){
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
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
