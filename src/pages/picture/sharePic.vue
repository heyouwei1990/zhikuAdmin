<template>
  <div>
    <div class="search">
      <el-form ref="form">
        <el-button type="primary" size="small" class='create' @click='dialogVisible=true' v-show='addIsShow'>新建</el-button>
      </el-form>
    </div>
    <div class="table">
      <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" highlight-current-row style="width: 100%" @select='select' @select-all='select' @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="60"> </el-table-column>
        <el-table-column prop="id" width='100' label="编号"> </el-table-column>
        <el-table-column prop="phone" width='150' label="图片">
          <template slot-scope="scope">
            <img :src="scope.row.bannerurl" class="img">
          </template>
        </el-table-column>
        <el-table-column prop="is_del" :formatter='formatIsDel' width='120' label="显示状态"> </el-table-column>
        <el-table-column prop="sequence" width="120" label="显示顺序"></el-table-column>
        <el-table-column label="操作" min-width='120' show-overflow-tooltip>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)' v-show='editIsShow'>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini" type='danger' v-if='delAll'>批量删除</el-button>
        <el-button size="mini" disabled v-else>批量删除</el-button>
      </div>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" class='page' :current-page="page" :page-sizes="[1,10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </div>
    <!-- 添加图片 -->
    <el-dialog title="添加图片" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="图片">
          <!--<uploadImg :type='type' @ievent="ievent"></uploadImg>-->
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input v-model="addForm.banner_meetingid" placeholder="请输入链接地址"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序">
          <el-input v-model="addForm.sequence"  placeholder="请输入显示顺序"></el-input>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="addForm.is_del" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addPic">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑图片 -->
    <el-dialog title="编辑图片" :visible.sync="dialogVisible2" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :model="editForm" label-width="80px">
        <el-form-item label="图片">
          <!--<uploadImg :type='type' @ievent="ievent" :img='editForm.bannerurl'></uploadImg>-->
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input v-model="editForm.banner_meetingid" placeholder="请输入链接地址"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序">
          <el-input v-model="editForm.sequence"  placeholder="请输入显示顺序"></el-input>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="editForm.is_del" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="editPic">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import axios from 'axios';
  import qs from 'qs'
//  import uploadImg from '@/components/uploadImg'
//  import { imgUrl } from '../../../config/common';
export default {
  name: 'lecturerList',
  components:{
//    uploadImg
  },
  data () {
    return {
      type:'bannerurl',
      tableData: [],
      addForm:{
        banner_meetingid:"",
        bannerurl:"",
        sequence:"",
        is_del:"0"
      },
      editForm:{
        id:"",
        banner_meetingid:"",
        bannerurl:"",
        sequence:"",
        is_del:"0"
      },
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
      dialogVisible2:false,
      options: [{
        value: '0',
        label: '否'
      }, {
        value: '1',
        label: '是'
      }],
      page:1,
      pageSize:20,
      total:1,
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
    this.init();
  },
  methods:{
    formatIsDel: function (row, column) {
      return row.is_del == 0 ? '否' : row.is_del == 1 ? '是': '未知';
    },
    formUrl:function(row,column){
      return row.bannerurl = imgUrl()+"/"+this.type+"/"+row.bannerurl
    },
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
      this.init();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.init();
    },
    onSubmit(){

    },
    ievent(e){
      var url = e.data.url;
      this.addForm.bannerurl = url;
      this.editForm.bannerurl = url;
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
    addPic(){
      var params = this.addForm,that = this;
        params['token'] = window.sessionStorage.getItem("token");
        params['bannerurl'] = this.type+"/"+params['bannerurl']
      axios.post(process.env.API_ROOT+'/banner/add', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
          that.dialogVisible = false;
          that.init({});
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
      })
      .catch(function(err){

      });
    },
    init(){
      var params = {},that = this;
        params['token'] = window.sessionStorage.getItem("token");
        params['page'] = this.page;
        params['pageSize'] = this.pageSize;
        params['type'] = 1;
      axios.post(process.env.API_ROOT+'/banner/index', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          var list = res.data.data.list;
          var len = list.length;
          for(var i =0;i<len;i++){
            list[i]['bannerurl'] = imgUrl()+"/"+list[i]['bannerurl']
          }
          that.tableData = list
          that.total = Number(res.data.data.pager.Counts);
          that.page = res.data.data.pager.page;
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
      })
      .catch(function(err){

      });
    },
    edit(item){
      this.dialogVisible2 = true;
      this.editForm.id = item.row.id;
      this.editForm.bannerurl = item.row.bannerurl
      this.editForm.banner_meetingid = item.row.banner_meetingid;
      this.editForm.sequence = item.row.sequence;
      this.editForm.is_del = item.row.is_del;
    },
    editPic(){
      var params = this.editForm,that = this;
        params['token'] = window.sessionStorage.getItem("token");
        params['bannerurl'] = this.type+"/"+params['bannerurl'];
      axios.post(process.env.API_ROOT+'/banner/update', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.dialogVisible2 = false;
          that.init();
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
      })
      .catch(function(err){

      });
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
