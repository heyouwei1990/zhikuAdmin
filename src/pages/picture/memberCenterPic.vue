<template>
  <div>
    <div class="search">
      <el-form ref="form">
        <el-button type="primary" size="small" class='create' @click='dialogVisible=true'>新建</el-button>
      </el-form>
    </div>
    <div class="table">
      <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" highlight-current-row style="width: 100%" @select='select' @select-all='select' @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="60"> </el-table-column>
        <el-table-column prop="name" width='100' label="编号"> </el-table-column>
        <el-table-column prop="name" width='120' label="名称"> </el-table-column>
        <el-table-column prop="name" width='120' label="分类"> </el-table-column>
        <el-table-column width='150' label="图片">
          <template slot-scope="scope">
            <img :src="scope.row.img" class="img">
          </template>
        </el-table-column>
        <el-table-column prop="name" width='120' label="显示状态"> </el-table-column>
        <el-table-column min-width="120" label="更新时间">
          <template slot-scope="scope">{{ scope.row.date }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" show-overflow-tooltip>
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
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入轮播图名称"></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <!--<uploadImg></uploadImg>-->
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input v-model="form.name" placeholder="请输入链接地址"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序">
          <el-input v-model="form.name"  placeholder="请输入显示顺序"></el-input>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="value" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
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
//  import uploadImg from '@/components/uploadImg'
//  import { imgUrl,isLogin} from '../../../config/common';
export default {
  name: 'lecturerList',
  components:{
    //uploadImg
  },
  data () {
    return {
      tableData: [{
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        img:"http://0d077ef9e74d8.cdn.sohucs.com/qRBNCvh_jpeg",
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
      delAll:false,
      activeIndex: '3',
      dialogVisible:false,
      value:"是",
      options: [{
        value: '是',
        label: '是'
      }, {
        value: '否',
        label: '否'
      }],
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
    handleSelect(){

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
    text-decoration: none;
    display: inline-block;
    width: 100%;
    height: 100%;
  }
  img.img{
    width: 100px;
    height: 50px;
  }
</style>
