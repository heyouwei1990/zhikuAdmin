<template>
  <div>
    <el-form ref="form" :model="form" label-width="80px" style="margin:20px;width:60%;min-width:600px;">
      <el-form-item label="会议主题">
        <el-input v-model="form.meetingtitle" clearable placeholder='请填写会议主题'></el-input>
      </el-form-item>
      <el-form-item label="会议城市">
        <el-col :span="6">
          <el-select v-model="provinceInfo" @change='getProvinceId'>
            <el-option v-for="item in provinceOptions" :key="item.provinceid" :label="item.province" :value="item.provinceid+'*'+item.province"> </el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="cityInfo" @change='getCityId'>
            <el-option v-for="item in cityOptions" :key="item.cityid" :label="item.city" :value="item.cityid+'*'+item.city"> </el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="districtInfo" @change='getAreaId'>
            <el-option v-for="item in areaOptions" :key="item.areaid" :label="item.area" :value="item.areaid+'*'+item.area"> </el-option>
          </el-select>
        </el-col>
      </el-form-item>
      <el-form-item label="会议地址">
        <el-input v-model="form.specificsite" clearable placeholder='请填写详细地址' @blur='blurIvent'></el-input>
      </el-form-item>
      <el-form-item label="会议海报">
        <div class="img">
          <uploadImg @ievent="ievent" :type='type' v-model='form.meetingurl'></uploadImg>
        </div>
      </el-form-item>
      <el-form-item label="会议时间">
        <el-col>
          <el-date-picker v-model="date" @change='getDate' type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="名额限制">
        <el-input-number v-model="form.numberpeople" type='number' controls-position="right" :min="1" :max="999999"></el-input-number>
        <span style="margin-left: 10px;">人</span>
      </el-form-item>
      <el-form-item label="报名费用">
        <el-input v-model="form.cost" clearable placeholder='请填写报名费用' style='width: 200px;'></el-input><span style="margin-left: 10px;">元</span>
      </el-form-item>
      <el-form-item label="截止时间">
        <el-col :span="11">
          <el-date-picker v-model="deadlinetime"  type="datetime" placeholder="报名截止时间">  </el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="会议状态">
        <el-select v-model="form.start" placeholder="请选择">
          <el-option label="上架" value="1"></el-option>
          <el-option label="下架" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="会议分类">
        <el-select v-model="form.meeting_type_id" placeholder="请选择">
          <el-option v-for="item in MeetingTypeList" :key="item.meetingtypeid" :label="item.typename" :value="item.meetingtypeid">  </el-option>
        </el-select>
      </el-form-item>
      <el-row>
        <el-col :span="6">
          <el-form-item label="开启权限">
            <el-radio-group v-model="open_power">
              <el-radio label="0">否</el-radio>
              <el-radio label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="6" v-show='open_power==1'>
          <el-form-item label="权限级别">
            <el-select v-model="form.meeting_level" placeholder="请选择">
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
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="会议种类">
            <el-select v-model="category" placeholder="请选择">
              <el-option label="普通会议" value="1"> </el-option>
              <el-option label="升级会议" value="2"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6" v-show='category==2'>
          <el-form-item label="对应级别">
            <el-select v-model="form.meeting_reward_plant_level" placeholder="请选择">
              <el-option label="VIP" value="1"> </el-option>
              <el-option label="弟子合伙人" value="2"> </el-option>
              <el-option label="创业" value="3"> </el-option>
              <el-option label="院长" value="4"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="分润类型">
        <el-select v-model="form.meeting_fengrun_type" placeholder="请选择">
          <el-option label="正常分润会议" value="0"> </el-option>
          <el-option label="398特殊分润会议" value="1"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="主办方">
        <div class="sponsorBg" v-if='sponsorData'>
          <span><strong>名称：</strong>{{sponsorData.sponsorname}} </span>
          <span><strong>联系方式：</strong>{{sponsorData.phone}}</span>
          <i class="el-icon-circle-close-outline" style="float: right;margin: 12px;" @click='sponsorData = ""'></i>
          <img style="float: right; margin-right: 50px" :src="sponsorData.sponsorurl" class="lecture">
        </div>
        <el-button size='small' type='primary' @click='dialogVisible2 = true' v-else>选择主办方</el-button>
      </el-form-item>
      <el-form-item label="讲师">
        <div v-if='lecturerNewData.length'>
          <div class="sponsorBg" v-for='(item,index) in lecturerNewData'>
            <span><strong>名称：</strong>{{item.lecturer_name}} </span>
            <i class="el-icon-circle-close-outline" style="float: right;margin: 12px;" @click='delLecture(index)'></i>
            <img style="float: right; margin-right: 50px" :src="item.lecturer_picture" class="lecture">
          </div>
          <el-button size='small' type='primary' @click='dialogVisible = true'>选择讲师</el-button>
        </div>
        <el-button size='small' type='primary' v-else @click='dialogVisible = true'>选择讲师</el-button>
      </el-form-item>
      <el-form-item label="会议详情">
        <div id="ueditor" type="text/plain"></div>
        <div class="yangshi">
          <!--<uploadImg @ievent="ievent" :type='type1'></uploadImg>-->
        </div>
      </el-form-item>
      <el-form-item label="分润设置">
        <el-row>
          <el-col :span="8" class='tl'>
            <span>平台抽成比例：</span>
            <el-input v-model="form.meeting_plant_reward" style='width: 100px;'></el-input>
            <i>%</i>
          </el-col>
          <el-col :span="8" class='tl'>
            <span>讲师抽成比例：</span>
            <el-input v-model="form.meeting_lecturer_reward" style='width: 100px;'></el-input>
            <i>%</i>
          </el-col>
          <el-col :span="8" class='tl' v-if='form.meeting_fengrun_type==0'>
            <span>会议红利比例：</span>
            <el-input v-model="form.meeting_dividend" style='width: 100px;'></el-input>
            <i>%</i>
          </el-col>
          <el-col :span="8" class='tl' v-else>
            <span>上级分润比例：</span>
            <el-input v-model="form.superior_division" style='width: 100px;'></el-input>
            <i>%</i>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmitForm">提交</el-button>
      </el-form-item>
    </el-form>

    <!-- 主办方 -->
    <el-dialog  title="选择主办方" :visible.sync="dialogVisible2" width="80%" :before-close="handleClose">
      <sponsor @ievent3="ievent3"></sponsor>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelBtn">取 消</el-button>
        <el-button type="primary" @click='sponsorBtn'>确 定</el-button>
      </span>
    </el-dialog>

    <!-- 讲师 -->
    <el-dialog  title="选择讲师2"  :visible.sync="dialogVisible" width="80%"  :before-close="handleClose">
      <lecturer @ievent2="ievent2"></lecturer>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelBtn">取 消</el-button>
        <el-button type="primary" @click="lectureBtn">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  // import '../../../static/UE/ueditor.config';
  // import '../../../static/UE/ueditor.all';
//  import axios from 'axios';
//  import qs from 'qs'
//  import uploadImg from '@/components/uploadImg'
  import lecturer from '@/pages/meeting/lecturer'
  import sponsor from '@/pages/meeting/sponsor'
  //import { imgUrl } from '../../../config/common';
  var lecturerData = [],
      sponsorData = [];
export default {
  name: 'addMeeting',
  components:{
    lecturer,
    sponsor
  },
  data () {
    return {
      type:"meetingurl",
      type1:"meetingImages",
      lecturerTableData: [],
      sponsorTableData:[],
      form: {
        meetingtitle: '',             //会议主题
        province:'',                  //省
        city:'',                      //市
        district:'',                  //区
        province_id:'',               //省id
        city_id:'',                   //市id
        district_id:'',               //区id
        specificsite:'',              //具体地址
        latitude:'',                  //纬度
        longitude:'',                 //经度
        meetingurl:'',                //封面图
        lecturerlist:'',              //讲师信息
        start:'1',                    //会议状态
        deadlinetime:'',              //截止时间
        numberpeople:'',              //名额限制
        cost:'',                      //报名费用
        meetingdetails:'',            //活动详情
        meeting_type_id:'',           //会议分类
        meeting_fengrun_type:'0',     //分润类型
        meeting_plant_reward:'',      //平台抽成比例
        meeting_lecturer_reward:'',   //讲师抽成比例
        meeting_dividend:'',          //会议红利比例
        superior_division:'',         //上级分润比例
        meeting_level:'1',            //权限级别
        sponsor_id:'',                //主办方id
        sponsor_name:'',              //主办方姓名
        meeting_type_id:'2',
        meeting_reward_plant_level:'1'//会议种类
      },
      dialogVisible:false,
      dialogVisible2:false,
      open_power:'0',
      category:'1',
      date:'',//开始时间/结束时间,
      deadlinetime:'',//截止时间
      selectSponsor:"",
      selectLecture:"",
      levelIsShow:false,
      plantLevelIsShow:false,
      profitYpeIsShow:false,
      ueditor: '',
      provinceOptions:[],
      cityOptions:[],
      areaOptions:[],
      provinceInfo:'',
      cityInfo:'',
      districtInfo:'',
      lecturerForm:{
        phone:'',
        name:'',
        status:'1'
      },
      sponsorForm:{
        phone:'',
        sponsorname:'',
        status:'1'
      },
      lecturePage:1,
      lecturePageSize:20,
      lectureTotal:1,
      sponsorPage:1,
      sponsorPageSize:20,
      sponsorTotal:1,
      MeetingTypeList:[],
      sponsorData:"",//选的某个主办方
      lectureArr:[],//选中的讲师
      lecturerNewData:[]
    }
  },
  mounted:function(){
    this.ueditor = UE.getEditor('ueditor',{
      BaseUrl: '',
      UEDITOR_HOME_URL: 'static/UE/'
    })
    this.getProvince();
    this.typeList();
    this.basicSettingInit();
  },
  methods:{//获取讲师
    ievent2(data){
      lecturerData = data;
    },
    ievent3(data){
      sponsorData = data;
    },
    getDate(){
      this.deadlinetime = Date.parse(this.date[1])
    },
    getProvince(){
      var that = this,params = {};
      params['token'] = window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/user/provinces', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.provinceOptions = res.data.data;
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
    },//根据省的id获取市
    getProvinceId(){
      var provinceInfo = this.provinceInfo;
      var province_id = provinceInfo.split("*")[0];
      var province = provinceInfo.split("*")[1];
      this.form.province_id = province_id;
      this.form.province = province;
      this.getCity(province_id)
    },//获取市
    getCity(provinceid){
      var that = this,params = {};
      params['provinceid'] = provinceid;
      params['token'] = window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/user/city', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.cityOptions = res.data.data;
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
    },//根据市的id获取区或县
    getCityId(){
      var cityInfo = this.cityInfo;
      var city_id = cityInfo.split("*")[0];
      var city = cityInfo.split("*")[1];
      this.form.city_id = city_id;
      this.form.city = city;
      this.getArea(city_id)
    },//获取地区
    getArea(cityid){
      var that = this,params = {};
      params['cityid'] = cityid;
      params['token'] = window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/user/area', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.areaOptions = res.data.data;
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
    getAreaId(){
      var districtInfo = this.districtInfo;
      var district_id = districtInfo.split("*")[0]
      var district = districtInfo.split("*")[1]
      this.form.district = district;
      this.form.district_id = district_id;
    },//根据地址逆解析获取经纬度
    blurIvent(){
      if(!this.form.specificsite)return
      var address = this.form.province+this.form.city+this.form.district+this.form.specificsite;
      var params = {},that = this;
        params['token']=window.sessionStorage.getItem("token");
        params['address']=address;
      axios.post(process.env.API_ROOT+'/meeting/getgeo', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          var data = res.data.data.location;
          that.form.latitude = data.lat;
          that.form.longitude = data.lng;
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
    },//上传图片
    ievent(data){
      if(data.data.type=='meetingImages'){
        this.ueditor.setContent(this.ueditor.getContent()+'<img src="'+imgUrl()+'/'+this.type1+"/"+data.data.url+'" />',false);
      }else{
        this.form.meetingurl = data.data.url;
      }
    },//确定主办方
    sponsorBtn(){
      if(!sponsorData){
        this.$message("请选择主办方");
        return;
      }else{
        this.sponsorData = sponsorData;
        this.dialogVisible2 = false;
        this.form.sponsor_id=sponsorData.sponsorid;
        this.form.sponsor_name=sponsorData.sponsorname;
        this.form.sponsor_phone=sponsorData.sponsorphone;
      }
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
      .then(_ => {
        done();
      })
      .catch(_ => {});
    },//确定讲师
    lectureBtn(){
      var data = this.lecturerNewData;
      if(!lecturerData.length){
        this.$message("请选择讲师");
        return;
      }else{
        for(var i = 0;i<lecturerData.length;i++){
          if(JSON.stringify(data).indexOf(JSON.stringify(lecturerData[i]))==-1){
            this.lecturerNewData.push(lecturerData[i])
          }
        }
        this.dialogVisible = false
      }
    },//删除讲师
    delLecture(idx){
      var data = this.lecturerNewData;
      data.splice(idx,1);
      this.lecturerNewData = data;
    },
    cancelBtn(){
      this.dialogVisible2 = false;
      this.dialogVisible = false;
      this.sponsorData = '';
      this.selectLecture = ''
    },//添加会议
    onSubmitForm(){
      var params = this.form,that = this;
      var meetingtime = Date.parse(this.date[0]);
      var sponsorid = this.selectSponsor.sponsorid;
      var endtime = Date.parse(this.date[1]);
      var lecturerData = this.lecturerNewData;
          if(params['meetingtitle'].length>30){
            that.$message({
              showClose: true,
              message: '会议主题不能大于30个字！',
              type: 'warning'
            });
            return;
          }
          for(var i = 0;i<lecturerData.length;i++){
            lecturerData[i]['lecturer_url'] = lecturerData[i]['lecturer_picture'].split("/")[3]+"/"+lecturerData[i]['lecturer_picture'].split("/")[4]
            lecturerData[i]['lecture_details'] = lecturerData[i]['lecturer_details']
          }
          if(this.category==1){
            params['meeting_reward_plant_level'] = 0;
          }
          if(this.open_power==0){
            params['meeting_level'] = 0;
          }
          params['meetingtime'] = meetingtime/1000;
          params['endtime'] = endtime/1000;
          params['meetingdetails'] = this.ueditor.getContent();
          params['lecturerlist']=JSON.stringify(lecturerData)
          params['meetingurl']=this.type+'/'+params['meetingurl']
          params['token']=window.sessionStorage.getItem("token");
          params['deadlinetime'] = Date.parse(that.timeConverter(that.deadlinetime/1000));
          if(!params['meetingdetails']){
             that.$message({
              showClose: true,
              message: '请输入会议详情',
              type: 'warning'
            });
            return;
          }
        axios.post(process.env.API_ROOT+'/meeting/add', qs.stringify(params),{
          headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(function(res){
          var status=res.data.status;
          if(status==0){
            that.$message({
              showClose: true,
              message: '添加成功',
              type: 'success'
            });
            that.$router.push({path: '/meetingList'});
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
    typeList(){
      var params = {},that = this;
      params['token']=window.sessionStorage.getItem("token");
      params['page']=1;
      params['pageSize']=100;
      axios.post(process.env.API_ROOT+'/meeting/MeetingTypeList', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.MeetingTypeList = res.data.data.list;
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
    },//获取基础设置信息
    basicSettingInit(){
      var params ={
        token:window.sessionStorage.getItem("token")
      },
      that = this;
      axios.post(process.env.API_ROOT+'/adminseting/index', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.form.meeting_plant_reward = res.data.data.flat_lift_ratio.value;//平台抽成比例
          that.form.meeting_lecturer_reward = res.data.data.lecturer_proportionate.value;//讲师抽成比例
          that.form.meeting_dividend = res.data.data.dividend_ratio.value;//会议红利比例
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
    timeConverter(UNIX_timestamp){
      var a = new Date(UNIX_timestamp);
      var months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec ;
      return time;
    }
  },
  destroyed() {
    this.ueditor.destroy();
  },

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
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
  .el-form-item{
    margin-bottom: 12px;
  }
  .sponsorBg{
    width: 100%;
    height: 40px;
    background: #f5f5f5;
    margin:0 0 4px;
    position: relative;
  }
  .sponsorBg span{
    margin-left: 10px;
  }
  .normalProfit{
    width: calc(100%-20px);
    height: auto;
    overflow: hidden;
    padding:20px;
  }
  .normalProfit .plate{
    float: left;
    width: 30%;
    font-size: 12px;
  }
  .meetingSet{
    width: 100%;
    clear: both;
    height: auto;
    margin-top: 10px;
  }
  .clearfix:after{
    display: block;
    content:'';
    clear: both;
    height:0;
  }
  .tl{
    text-align: center;
  }
  .ueditorsfs{
    position: relative;
  }
  .yangshi{
    width: 15px;
    height: 15px;
    background: url('../../assets/sc.png') no-repeat;
    background-size: 100% 100%;
    position: absolute;;
    top:96px;
    left: 65%;
    z-index: 10000;
    overflow: hidden;
  }
  img.aS{
    width: 60px;
    height: 60px;
    border-radius: 50%
  }
  img.lecture{
    width: 65px;
    height: 38px;
    vertical-align: middle;
  }
</style>
