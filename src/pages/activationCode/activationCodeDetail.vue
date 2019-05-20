<template>
  <div>
    <div class="search">
      <el-form ref="form" :model="form">
        <el-input v-model="form.name" placeholder="会员昵称"   @keyup.enter.native="onSubmit"></el-input>
        <el-input v-model="form.name" placeholder="会员手机号" @keyup.enter.native="onSubmit"></el-input>
        <el-button type="primary" size="small" @click="onSubmit">查询</el-button>
        <el-button type="primary" size="small" class='create' @click='dialogVisible=true'>新建</el-button>
      </el-form>
    </div>
    <div class="table">
      <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" highlight-current-row @select='select' @select-all='select' @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="序号" width="120"></el-table-column>
        <el-table-column prop="name" label="会员昵称" width="120"></el-table-column>
        <el-table-column prop="phone" label="会员手机号" width="120"></el-table-column>
        <el-table-column prop="name" label="总激活码数量" width="120"></el-table-column>
        <el-table-column prop="name" label="未提取激活码数量" width="120"></el-table-column>
        <el-table-column prop="name" label="待使用激活码数量" width="120"></el-table-column>
        <el-table-column prop="name" label="已使用激活码数量" width="120"></el-table-column>
        <el-table-column label="获得时间" width="120">
          <template slot-scope="scope">{{ scope.row.date }}</template>
        </el-table-column>
        <el-table-column label="变更时间" width="120">
          <template slot-scope="scope">{{ scope.row.date }}</template>
        </el-table-column>
        <el-table-column label="已提取激活码变动详情" min-width="120">
          <template slot-scope="item">
            <el-button size="mini" type="warning">详情</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width='150' show-overflow-tooltip>
          <template slot-scope="item">
            <el-button size="mini" type="primary">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
          <el-button size="mini" type='danger' v-if='delAll'>批量删除</el-button>
          <el-button size="mini" disabled v-else>批量删除</el-button>
      </div>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" class='page' :current-page="page" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog title="" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="form.name" placeholder='请输入手机号'></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.name" placeholder='请输入昵称'></el-input>
        </el-form-item>
        <el-form-item label="激活码数">
          <el-input v-model="form.name" placeholder='请输入激活码数量'></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="form.desc" placeholder='请输入备注'></el-input>
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
      tableData: [],
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
      value:"选项1",
      options: [{
        value: '选项1',
        label: '全部'
      }, {
        value: '选项2',
        label: '正常'
      }, {
        value: '选项3',
        label: '冻结'
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
      this.pageSize = val;
    },
    handleCurrentChange(val) {
      this.page = val;
    },
    onSubmit(){

    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
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
