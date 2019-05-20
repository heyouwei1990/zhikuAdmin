<template>
  <div>
    <div class="search">
      <el-form ref="form" :inline="true">
        <el-form-item label="主办方名称">
          <el-input v-model="form.meetingNumber" placeholder="请输入主办方名称" ></el-input>
        </el-form-item>
        <el-form-item label="主办方名称">
          <el-input v-model="form.name" placeholder="请输入主办方名称" ></el-input>
        </el-form-item>
        <el-form-item label="会议分类">
          <el-select v-model="form.meetingTypeId" placeholder="请选择" class='select'>
            <el-option v-for="item in options" :key="item.meetingtypeid" :label="item.typename" :value="item.meetingtypeid"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="form.start" placeholder="请选择" class='select' >
            <el-option label="全部" value=""></el-option>
            <el-option label="上架" value="1"></el-option>
            <el-option label="下架" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" highlight-current-row  @cell-click='selectMeeting'>
        <el-table-column prop="meetingid" label="#id" width='50'> </el-table-column>
        <el-table-column prop="meetingNumber" label="会议编号"> </el-table-column>
        <el-table-column prop="sponsorname"  label="主办方"> </el-table-column>
        <el-table-column prop="meetingTypeInfo.typename" label="会议分类"> </el-table-column>
        <el-table-column prop="meetingtitle" label="会议主题"> </el-table-column>
        <el-table-column label="会议海报" width='120'>
          <template slot-scope="scope">
            <a v-if="scope.row.meetingurl" :href="scope.row.meetingurl" target="blank">
              <img :src="scope.row.meetingurl" class="meetingHb" :title="scope.row.meetingtitle">
            </a>
          </template>
        </el-table-column>
        <el-table-column label="会议地点">
          <template slot-scope="scope">
            <div>
              {{scope.row.province}}
              <span v-if="scope.row.city">-</span>
              {{scope.row.city}}
              <span v-if="scope.row.district">-</span>
              {{scope.row.district}}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="开始时间">
          <template slot-scope="scope">{{new Date(scope.row.meetingtime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="lecturerNums" label="讲师数量"></el-table-column>
        <el-table-column prop="cost" label="报名费用"> </el-table-column>
        <el-table-column prop="tip" label="会议状态"> </el-table-column>
        <el-table-column prop="numberpeople" label="报名人数"> </el-table-column>
        <el-table-column prop="start" label="状态" :formatter='formatStart'></el-table-column>
        <el-table-column prop="name" label="发布时间">
          <template slot-scope="scope">{{new Date(scope.row.creatime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
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
  </div>
</template>
<script>
  import axios from 'axios';
  import qs from 'qs'
  import { imgUrl,isLogin} from '../../../config/common';
export default {
  name: 'lecturerList',
  components:{

  },
  data () {
    return {
      tableData: [],
      form: {
        name: '',
        meetingTypeId:'',
        start:'',
        meetingNumber:''
      },
      delItems:[],
      options: [],
      pageIndex:1,
      total:0,
      pageSize:10
    }
  },
  mounted(){
    this.getData();
    this.getMeetingType();
  },
  methods:{
    formatStart: function (row, column) {
      return row.start == 1 ? '上架' : row.start == 0 ? '下架' : '未知';
    },
    handleSelectionChange(e){
      // console.log(e)
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.init(this.form)
    },
    handleCurrentChange(val) {
      this.page = val;
      this.init(this.form)
    },
    onSubmit(){
      this.init(this.form)
    },
    selectMeeting(data){
      this.$emit('ievent1',data);
    },
    //获取会议列表
    init(params){
      var that = this;
      params['token'] = window.sessionStorage.getItem("token");
      params['page'] = this.page;
      params['pageSize'] = this.pageSize;
      axios.post(process.env.API_ROOT+'/meeting/index', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          var list = res.data.data.list;
          that.tableData = list;
          // 报名中/报名截止/进行中/已结束
          var curTime = Date.parse(new Date())/1000;//当前时间
          for(var i=0;i<list.length;i++){
            var meetingtime = Number(list[i]['meetingtime']);//会议开始时间
            var deadlinetime = Number(list[i]['deadlinetime']);//报名截止时间
            var endtime = Number(list[i]['endtime']);//会议结束时间
            list[i]['meetingurl'] = 'https://51njwl.com/'+list[i]['meetingurl']
            var tip;
            if (curTime < meetingtime) {
              tip = '报名中';
            }else if (meetingtime < curTime && curTime < deadlinetime) {
              tip = '进行中';
            } else if (curTime > deadlinetime && curTime < endtime) {
              tip = '报名截止';
            }  else if (curTime > endtime){
              tip = '已结束';
            }
            list[i]['tip'] = tip;
          }
          that.total = Number(res.data.data.pager.Counts)
          that.page = res.data.data.pager.page
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
    },//获取会议分类
    getMeetingType(){
      var params = {},that = this;
      params['token']=window.sessionStorage.getItem("token");
      params['page']=1;
      params['pageSize']=1000;
      axios.post(process.env.API_ROOT+'/meeting/MeetingTypeList', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          var args = {
            typename:"全部",
            meetingtypeid:""
          }
          var list = res.data.data.list;
          list.unshift(args)
          that.options = list;
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
    color: #20a0ff;
    text-decoration: none;
    display: inline-block;
    width: 100%;
    height: 100%;

  }
  .an{
    color: #fff;
    text-decoration: none
  }
  img.meetingHb{
    width: 100px;
    height: 59px;
  }
</style>
