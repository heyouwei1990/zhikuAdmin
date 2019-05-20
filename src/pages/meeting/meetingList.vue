<template>
  <div class="meetingList-page">
    <div class="search">
      <el-form ref="form" :inline="true" v-model="form">
        <el-form-item label="会议编号">
          <el-input v-model="form.meetingNumber" placeholder="请输入会议编号" @keyup.enter.native="getData" ></el-input>
        </el-form-item>
        <el-form-item label="主办方名称">
          <el-input v-model="form.sponsorname" placeholder="请输入主办方名称" @keyup.enter.native="getData" ></el-input>
        </el-form-item>
        <el-form-item label="会议分类">
          <el-select v-model="form.meetingTypeId" placeholder="请选择" class='select'  @change="getData">
            <el-option v-for="item in meetingTypes" :key="item.meetingtypeid" :label="item.typename" :value="item.meetingtypeid"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="form.start" placeholder="请选择" class='select'  @change="getData">
            <el-option label="全部" value=""></el-option>
            <el-option label="上架" value="1"></el-option>
            <el-option label="下架" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
          <el-button type="primary" size="small" v-if="!isComponent" @click="export2Excel">导出</el-button>
          <el-button type="primary" size="small" v-if="!isComponent" v-show="addIsShow" class='create' @click="$router.push({path:'/editMeeting'})">
            新建
          </el-button>
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
        @cell-click="selectTr"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column prop="meetingid" label="#id" width='50'> </el-table-column>
        <el-table-column prop="meetingNumber" label="会议编号"> </el-table-column>
        <el-table-column prop="sponsorname"  label="主办方"> </el-table-column>
        <el-table-column prop="meetingTypeName" label="会议分类"> </el-table-column>
        <el-table-column prop="meetingtitle" label="会议主题"> </el-table-column>
        <el-table-column label="会议海报" width='120'>
          <template slot-scope="scope">
            <a :href="scope.row.meetingurl" target="blank">
              <img v-if="scope.row.meetingurl" :src="formatImg(scope.row.meetingurl)" class="meetingHb" :title="scope.row.meetingtitle">
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
              {{scope.row.district}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="开始时间">
          <template slot-scope="scope">{{new Date(scope.row.meetingtime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="lecturerCount" label="讲师数量"></el-table-column>
        <el-table-column prop="cost" label="报名费用"> </el-table-column>
        <el-table-column prop="tip" label="会议状态"> </el-table-column>
        <el-table-column prop="numberpeople" label="报名人数"> </el-table-column>
        <el-table-column prop="start" label="状态" :formatter='formatStart'></el-table-column>
        <el-table-column prop="creatime" label="发布时间">
          <template slot-scope="scope">{{new Date(scope.row.creatime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="操作" min-width='350' show-overflow-tooltip v-if="!isComponent">
          <template slot-scope="item">
            <el-button size="mini" type="primary" v-if="editIsShow" @click="$router.push({path:'editMeeting',query:{id:item.row.meetingid}})">编辑</el-button>
            <el-button size="mini" type="primary" v-if="commentIsShow" @click="$router.push({path:'commentList',query:{id:item.row.meetingid}})">评论</el-button>
            <el-button size="mini" type="primary" v-if="shareIsShow" @click="$router.push({path:'shareList',query:{id:item.row.meetingid}})">分享</el-button>
            <el-button size="mini" type="primary" v-if="signUpIsShow" @click="$router.push({path:'signUp',query:{id:item.row.meetingid}})">报名</el-button>
            <el-button size="mini" type="primary" v-if="downIsShow" icon="el-icon-download" @click='down(item)'></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini" :disabled="delItems.length==0" type='danger' @click="mulDelete">批量删除</el-button>
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
  </div>
</template>
<script>
  import tool from '@/vendor/tool'
export default {
  name: 'lecturerList',
  data () {
    return {
      tableData: [],
      form: {
        sponsorname: '',
        meetingTypeId:'',
        start:'',
        meetingNumber:''
      },
      delItems:[],
      options: [],
      pageIndex:1,
      total:1,
      pageSize:10,
      loading:false,
      addIsShow:false,
      editIsShow:false,
      commentIsShow:false,
      shareIsShow:false,
      signUpIsShow:false,
      downIsShow:false,
    }
  },
  computed:{
    meetingTypes(){
      if(this.$store.state.meetingTypeList.length==0){
        this.$store.dispatch('getMeetingTypeList');
      }
      return this.$store.state.meetingTypeList;
    },
  },
  props:{
    isComponent:{
      type:Boolean,
      default:false
    }
  },
  mounted(){
    this.getData();
    this.getStorage();
  },
  methods:{
    //补全表格图片路径
    formatImg(url){
      return url?tool.imgBaseUrl+'/'+url:'';
    },
    formatStart: function (row, column) {
      return row.start == 1 ? '上架' : row.start == 0 ? '下架' : '未知';
    },
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/meeting/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        ...this.form
      }).then(r=>{
        this.loading=false;
        if(r.status==0){
          var list=r.data;
          var curTime=new Date().getTime();
          for(var i=0;i<list.length;i++){
            var meetingtime = list[i]['meetingtime']*1000;//会议开始时间
            var deadlinetime = list[i]['deadlinetime']*1000;//报名截止时间
            var endtime = list[i]['endtime']*1000;//会议结束时间
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
          this.tableData=list;
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
      this.$get('/backend/lecturer/deleteByIds',{
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
    //获取某一行数据
    selectTr(data){
      this.$emit('getItem',data);
    },
    //获取会议分类
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
    },
    down(item){
      var mid = item.row.meetingid;
      window.open(window.location.origin+'/backend/meeting/GetQrcode?id='+mid+'&token='+tool.getSession("token"))
    },
    getStorage(){
      var rules = tool.getSession("rules");
      if(rules == '*'){
        this.editIsShow = true;
        this.addIsShow = true;
        this.commentIsShow = true;
        this.shareIsShow = true;
        this.signUpIsShow = true;
        this.downIsShow = true;
        return;
      }
      var menuList = tool.getSession("menuList");
      for(var i = 0;i < menuList.length;i++){
        if(rules.indexOf(menuList[i]['id'])!=-1){
          if(menuList[i]['actionId']=='meeting/updatemeeting'){
            if(menuList[i]['showButton']==1){
              this.editIsShow = true;
            }else{
              this.editIsShow = false;
            }
          }
          if(menuList[i]['actionId']=='meeting/add'){
            if(menuList[i]['showButton']==1){
              this.addIsShow = true;
            }else{
              this.addIsShow = false;
            }
          }
          if(menuList[i]['actionId']=='comment/index'){
            if(menuList[i]['showButton']==1){
              this.commentIsShow = true;
            }else{
              this.commentIsShow = false;
            }
          }
          if(menuList[i]['actionId']=='share/index'){
            if(menuList[i]['showButton']==1){
              this.shareIsShow = true;
            }else{
              this.shareIsShow = false;
            }
          }
          if(menuList[i]['actionId']=='order/signup'){
            if(menuList[i]['showButton']==1){
              this.signUpIsShow = true;
            }else{
              this.signUpIsShow = false;
            }
          }
          if(menuList[i]['actionId']=='meeting/getqrcode'){
            if(menuList[i]['showButton']==1){
              this.downIsShow = true;
            }else{
              this.downIsShow = false;
            }
          }
        }
      }
    },
    export2Excel() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('../../vendor/Export2Excel');
        const tHeader = ['会议编号', '主办方', '会议分类', '会议主题', '会议地点','开始时间','讲师数量','报名费用','会议状态','报名人数','状态','发布时间'];
        const filterVal = ['meetingNumber', 'sponsorname', 'meetingTypeName', 'meetingtitle', 'province','meetingtime','lecturerCount','cost','tip','numberpeople','start','creatime'];
        const list = this.tableData;
        const data = tool.formatJson(filterVal, list);
        for(var i =0;i<data.length;i++){
          data[i][5] = tool.timeFormat(data[i][5])//变更时间
          data[i][10] = data[i][10]==0?"下架":"上架";//上下架状态
          data[i][11] = tool.timeFormat(data[i][11])//变更时间
        }
        export_json_to_excel(tHeader, data, '会议列表excel');
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.meetingList-page{
  .meetingHb{
    width: 100px;
    height: 59px;
  }
}
</style>
