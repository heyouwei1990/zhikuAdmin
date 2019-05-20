<template>
  <div class="editMeeting-page">
    <el-form ref="form" :rules="rules" :model="form" label-width="80px" class="form" >
      <el-form-item label="会议主题" prop="meetingtitle">
        <el-input v-model="form.meetingtitle" clearable placeholder='请填写会议主题'></el-input>
      </el-form-item>
      <el-form-item label="会议城市" prop="cityObj">
        <div class="select-ul">
          <div class="select-li">
            <el-select v-model="form.provinceObj" value-key="provinceid" @change='provinceChange'>
              <el-option v-if="provinceList.length>0" v-for="item in provinceList" :key="item.provinceid" :label="item.province" :value="item">
              </el-option>
            </el-select>
          </div>
          <div class="select-li">
            <el-select v-model="form.cityObj" value-key="cityid" @change='cityChange'>
              <el-option v-if="cityList.length>0" v-for="item in cityList" :key="item.cityid" :label="item.city" :value="item"></el-option>
            </el-select>
          </div>
          <div class="select-li">
            <el-select v-model="form.areaObj" value-key="areaid">
              <el-option v-if="areaList.length>0" v-for="item in areaList" :key="item.areaid" :label="item.area" :value="item"></el-option>
            </el-select>
          </div>
        </div>
        <!--<el-col :span="6">
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
        </el-col>-->
      </el-form-item>
      <el-form-item label="会议地址" prop="specificsite">
        <el-input v-model="form.specificsite" clearable placeholder='请填写详细地址'></el-input>
      </el-form-item>
      <el-form-item v-model="form.meetingurl" label="会议海报" prop="meetingurl">
        <uploader
          :fileName="fileName"
          @success="fileImg"
          @remove="removeImg"
          :image="bannerUrl"
        ></uploader>
      </el-form-item>
      <el-form-item label="会议时间" prop="date">
        <el-col>
          <el-date-picker
            v-model="form.date"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="timestamp"
          ></el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="名额限制" prop="numberpeople">
        <el-input-number v-model.number="form.numberpeople" type='number' controls-position="right" :min="0" :max="999999"></el-input-number>
        <span class="unit-text">人</span>
      </el-form-item>
      <el-form-item label="报名费用" prop="cost">
        <el-input v-model.number="form.cost" clearable placeholder='请填写报名费用' style='width: 200px;'></el-input><span class="unit-text">元</span>
      </el-form-item>
      <el-form-item label="截止时间" prop="deadlinetime">
        <el-col :span="11">
          <el-date-picker v-model="form.deadlinetime" format="yyyy-MM-dd hh:mm:ss" value-format="timestamp" type="datetime" placeholder="报名截止时间">  </el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="会议状态" prop="isDel">
        <el-select v-model="form.isDel" placeholder="请选择">
          <el-option label="上架" value="1"></el-option>
          <el-option label="下架" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="会议分类" prop="meetingTypeObj">
        <el-select v-model="form.meetingTypeObj" value-key="meetingtypeid" placeholder="请选择">
          <el-option v-if="meetingTypeList.length>0" v-for="item in meetingTypeList" :key="item.meetingtypeid" :label="item.typename" :value="item">  </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="开启权限" prop="openPower">
        <el-radio-group v-model="form.openPower" @change="powerChange">
          <el-radio label="0">否</el-radio>
          <el-radio label="1">是</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="权限级别" prop="meetingLevel"  v-show='form.openPower==1'>
        <el-select v-model="form.meetingLevel" placeholder="请选择">
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
      <el-form-item label="会议种类" prop="category">
        <el-select v-model="form.category" placeholder="请选择" @change='categoryChange'>
          <el-option label="普通会议" value="1"> </el-option>
          <el-option label="升级会议" value="2"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="对应级别" prop="meetingRewardPlantLevel" v-show='form.category==2'>
        <el-select v-model="form.meetingRewardPlantLevel" placeholder="请选择">
          <el-option label="VIP" value="1"> </el-option>
          <el-option label="弟子合伙人" value="2"> </el-option>
          <el-option label="创业" value="3"> </el-option>
          <el-option label="院长" value="4"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分润类型" prop="meetingFengrunType">
        <el-select v-model="form.meetingFengrunType" placeholder="请选择">
          <el-option label="正常分润会议" value="0"> </el-option>
          <el-option label="398特殊分润会议" value="1"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="主办方" prop="sponsorData">
        <div class="show-item" v-if='form.sponsorData'>
          <span><strong>主办方名称：</strong>{{form.sponsorData.sponsorname}} </span>
          <span><strong>联系方式：</strong>{{form.sponsorData.phone}}</span>
          <!--<img v-if="form.sponsorData.sponsorurl" :src="formatImg(form.sponsorData.sponsorurl)" class="icon">-->
          <i class="el-icon-circle-close-outline" @click='removeSponsor'></i>
        </div>
        <el-button size="small" type="primary" @click="sponsorVisible=true" v-else>选择主办方</el-button>
      </el-form-item>
      <el-form-item label="讲师" prop="lecturerNum">
        <div v-if="lecturerList.length">
          <div class="show-item" v-for="(item,index) in lecturerList" :key="index">
            <span><strong>讲师名称：</strong>{{item.lecturerName}} </span>
            <!--<img v-if="item.lecturerPicture" :src="formatImg(item.lecturerPicture)" class="icon">-->
            <i class="el-icon-circle-close-outline"  @click='removeLecturer(item.id)'></i>
          </div>
        </div>
        <el-button size="small" type="primary" @click="lecturerVisible=true">选择讲师</el-button>
      </el-form-item>
      <el-form-item label="会议详情">
        <div id="ueditor" type="text/plain"></div>
      </el-form-item>
      <el-form-item label="分润设置">
        <el-row>
          <el-col :span="8" >
            <el-form-item prop="meetingPlantReward">
              <span>平台抽成比例：</span>
              <el-input v-model.number="form.meetingPlantReward" class="short-input"></el-input>
              <i>%</i>
            </el-form-item>
          </el-col>
          <el-col :span="8" >
            <el-form-item prop="meetingLecturerReward">
              <span>讲师抽成比例：</span>
              <el-input v-model.number="form.meetingLecturerReward" class="short-input"></el-input>
              <i>%</i>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if='form.meetingFengrunType==0'>
            <el-form-item prop="meetingDividend">
              <span>会议红利比例：</span>
              <el-input v-model.number="form.meetingDividend" class="short-input"></el-input>
              <i>%</i>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-else>
            <el-form-item prop="superiorDivision">
              <span>上级分润比例：</span>
              <el-input v-model.number="form.superiorDivision" class="short-input"></el-input>
              <i>%</i>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">修改提交</el-button>
      </el-form-item>
    </el-form>
    <!-- 讲师 -->
    <el-dialog  title="选择讲师"  :visible.sync="lecturerVisible" width="60%"  :before-close="closeLecturer">
      <div class="scroller">
        <lecturerList :isComponent="true" @getItem="getLecturer"></lecturerList>
      </div>
      <!--<div class="search">
        <el-form ref="lecturerForm" :model="lecturerForm">
          <el-input v-model="lecturerForm.phone" placeholder="会员手机号" style='width:200px; margin-right:10px;'></el-input>
          <el-input v-model="lecturerForm.name" placeholder="讲师名称" style='width:200px; margin-right:10px;' ></el-input>
          <el-button type="primary" size="small" @click="lecturerOnSubmit">查询</el-button>
        </el-form>
      </div>
      <div class="table">
        <el-table ref="multipleTable" :data="lecturerTableData" highlight-current-row tooltip-effect="dark" style="width: 100%" @select='lecturerSelect' @select-all='lecturerSelect'>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="序号" width="120"></el-table-column>
          <el-table-column prop="nickName" label="会员昵称" width="120"></el-table-column>
          <el-table-column prop="phone" label="会员手机号" width="120"></el-table-column>
          <el-table-column prop="lecturerName" label="讲师姓名" width="120"></el-table-column>
          <el-table-column label="讲师头像" width="120">
            <template slot-scope='scope'>
              <img :src="scope.row.lecturerPicture" class='imgC'>
            </template>
          </el-table-column>
          <el-table-column prop="lecturerDetails" label="讲师简介" min-width="120"></el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template slot-scope="scope">{{ scope.row.status==1?"开启":"关闭" }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div id="page1">
        <el-pagination  @size-change="handleSizeChange" @current-change="handleCurrentChange" class='page' :current-page="lecturePage"  :page-sizes="[1,10, 20, 30, 40]" :page-size="lecturePageSize" layout="total, sizes, prev, pager, next, jumper" :total="lectureTotal"></el-pagination>
      </div>-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeLecturer">取 消</el-button>
        <el-button type="primary" @click="setLecturer">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 主办方 -->
    <el-dialog  title="选择主办方" :visible.sync="sponsorVisible" width="60%" :before-close="closeSponsor">
      <div class="scroller">
        <sponsorList :isComponent="true" @getItem="getSponsor"></sponsorList>
      </div>

      <!--<div class="search">
        <el-form ref="sponsorForm" :form='sponsorForm'>
          <el-input v-model="sponsorForm.sponsorname" placeholder="主办方名称" style='width:200px;'></el-input>
          <el-input v-model="sponsorForm.phone" placeholder="会员手机号" style='width:200px; margin:0 10px;'></el-input>
          <el-button type="primary" size="small" @click="sponsorOnSubmit">查询</el-button>
        </el-form>
      </div>
      <div class="table">
        <el-table ref="singleTable" :data="sponsorTableData" highlight-current-row  tooltip-effect="dark" style="width: 100%"  @cell-click="sponsorCellClick">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="sponsorid" width='100' label="编号"></el-table-column>
          <el-table-column prop="userName" width='120' label="会员昵称"></el-table-column>
          <el-table-column prop="phone" width='120' label="会员手机号"></el-table-column>
          <el-table-column prop="sponsorname" width="120" label="主办方名称"></el-table-column>
          <el-table-column width='120' label="logo">
            <template slot-scope='scope'>
              <img :src="scope.row.sponsorurl" class='imgC'>
            </template>
          </el-table-column>
          <el-table-column prop="sponsorphone" width='120' label="主办方联系方式"></el-table-column>
          <el-table-column prop="sponsorintro" min-width='120' label="主办方简介"></el-table-column>
          <el-table-column prop="status" width='120' label="状态">
            <template slot-scope='scope'>{{scope.row.status==0?"关闭":"开启"}}</template>
          </el-table-column>
        </el-table>
      </div>
      <div id="page2">
        <el-pagination  @size-change="sponsorHandleSizeChange" @current-change="sponsorHandleCurrentChange" class='page' :current-page="sponsorPage"  :page-sizes="[1,10, 20, 30, 40]" :page-size="sponsorPageSize" layout="total, sizes, prev, pager, next, jumper" :total="sponsorTotal">  </el-pagination>
      </div>-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeSponsor">取 消</el-button>
        <el-button type="primary" @click='setSponsor'>确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import '../../../static/UE/ueditor.config';
  import '../../../static/UE/ueditor.all';
  import '../../../static/UE/ueditor.parse';
  import { mapState } from 'vuex'
  import tool from '@/vendor/tool'
  import uploader from '@/components/uploader'
  import sponsorList from '@/pages/sponsor/sponsorList'
  import lecturerList from '@/pages/lecturer/lecturerList'
  import axios from 'axios';
  import qs from 'qs'
//  import uploadImg from '@/components/uploadImg'
//  import { imgUrl} from '../../../config/common';
export default {
  name: 'editMeeting',
  components:{
    uploader,
    sponsorList,
    lecturerList
  },
  data () {
    var vNumber=(rule,value,callback)=>{
      if(!/^[+]{0,1}(\d+)$/g.test(value)){
        callback(new Error('请输入正整数'))
      }else{
        callback();
      }
    };
    var vMeetingLevel=(rule,value,callback)=>{
      if(this.form.openPower==1 && value==''){
        callback(new Error('请选择权限级别'))
      }else{
        callback();
      }
    };
    var vMeetingRewardPlantLevel=(rule,value,callback)=>{
      if(this.form.category==2 && value==''){
        callback(new Error('请选择升级等级'))
      }else{
        callback();
      }
    };
    var vMeetingDividend =(rule,value,callback)=>{
      if(this.form.meetingFengrunType==0 && value==''){
        callback(new Error('请输入会议红利比例'))
      }else{
        callback();
      }
    };
    var vSuperiorDivision=(rule,value,callback)=>{
      if(this.form.meetingFengrunType==1 && value==''){
        callback(new Error('请输入上级分润比例'))
      }else{
        callback();
      }
    };
    var vCity=(rule,value,callback)=>{
      if(value==''){
        callback(new Error('请输入上级分润比例'))
      }else{
        callback();
      }
    };
    return {
      ueditor: '',
      fileName:'meetingBanner',
      bannerUrl:'',
      editId:null,
      form: {
        meetingtitle: '',             //会议主题
        provinceObj:'',
        cotyObj:'',
        areaObj:'',
        specificsite:'',              //具体地址
        meetingurl:'',                //封面图
        date:'',
        numberpeople:0,              //名额限制
        cost:0,                      //报名费用
        deadlinetime:'',              //截止时间
        isDel:'1',                    //会议状态
        meetingTypeObj:'',
        openPower:'0',
        meetingLevel:'',
        category:'1', //会议种类
        meetingRewardPlantLevel:'', //对应级别
        meetingFengrunType:"",
        meetingPlantReward:'', //平台抽成比例
        meetingLecturerReward:'',//讲师抽成比例
        meetingDividend:'',          //会议红利比例
        superiorDivision:'',         //上级分润比例
        sponsorData:'', //主办方
        lecturerNum:'', //讲师数量
      },
      rules:{
        meetingtitle:[{required:true, message:'请输入会议主题',trigger:'blur'}],
        cityObj:[{validator:vCity,trigger:'blur'}],
        specificsite:[{required:true, message:'请输入开会详细地址',trigger:'blur'}],
        meetingurl:[{required:true, message:'请上传会议海报',trigger:'blur'}],
        date:[{required:true, message:'请选择开会时间',trigger:'blur'}],
        numberpeople:[
          {required:true, message:'请输入名额限制',trigger:'blur'},
          {validator:vNumber,trigger:'blur'},
        ],
        cost:[
          {required:true, message:'请输入报名费用',trigger:'blur'},
          {validator:vNumber,trigger:'blur'},
        ],
        isDel:[{required:true, message:'请选择会议状态',trigger:'blur'}],
        deadlinetime:[{required:true, message:'请选择截止时间',trigger:'blur'}],
        meetingTypeObj:[{required:true, message:'请选择会议分类',trigger:'blur'}],
        openPower:[{required:true, message:'请选择是否开启权限',trigger:'blur'}],
        meetingLevel:[{validator:vMeetingLevel,trigger:'blur'}],
        meetingRewardPlantLevel:[{validator:vMeetingRewardPlantLevel,trigger:'blur'}],
        meetingFengrunType:[{required:true, message:'请选择会议分润类型',trigger:'blur'}],
        sponsorData:[{required:true, message:'请选择主办方',trigger:'blur'}],
        lecturerNum:[{required:true, message:'请选择讲师',trigger:'blur'}],
        meetingPlantReward:[
          {required:true, message:'请输入平台抽成比例',trigger:'blur'},
          { type: 'number', message: '必须输入数字'}
        ],
        meetingLecturerReward:[
          {required:true, message:'请输入讲师抽成比例',trigger:'blur'},
          { type: 'number', message: '必须输入数字'}
        ],
        meetingDividend:[
          {validator:vMeetingDividend,trigger:'blur'},
          { type: 'number', message: '必须输入数字'}
        ],
        superiorDivision:[
          {validator:vSuperiorDivision,trigger:'blur'},
          { type: 'number', message: '必须输入数字'}
        ],
      },
      cityList:[],
      areaList:[],
      lecturerList:[],
      lecturerVisible:false,
      sponsorVisible:false,
      selectSponsor:"",
      selectLecture:"",
    }
  },
  computed:{
    ...mapState({
      provinceList:state=>state.provinceList,
      meetingTypeList:state=>state.meetingTypeList,
    })
  },
  watch:{
    lecturerList(v){
      if(v.length>0){
        this.form.lecturerNum=v.length;
      }else{
        this.form.lecturerNum='';
      }
    }
  },
  created(){
    //如果省份列表为空，则请求列表
    if(this.provinceList.length==0){
      this.$store.dispatch('getProvinceList');
    }
    //如果会议分类列表为空，则请求列表
    if(this.meetingTypeList.length==0){
      this.$store.dispatch('getMeetingTypeList');
    }

  },
  mounted:function(){
    this.ueditor=UE.delEditor('ueditor');
    this.ueditor = UE.getEditor('ueditor',{
      BaseUrl: '',
      UEDITOR_HOME_URL: 'static/UE/',
    });
    this.ueditor.ready(()=> {
      this.ueditor.setHeight(400);
    })
    this.getInfo();
  },
  methods:{
    //编辑时显示数据
    getInfo(){
      this.editId=this.$route.query.id;
      if(!this.editId){
        return
      }
      this.$get('/backend/meeting/getById',{id:this.editId}).then(r=>{
        if(r.status==0){
          this.getCityList(r.data.provinceid);
          this.getAreaList(r.data.cityid);
          var data=r.data;
          var provinceObj={
            province:data.province,
            provinceid:data.provinceId
          };
          var cityObj={
            city:data.city,
            cityid:data.cityId
          };
          var areaObj={
            area:data.district,
            areaid:data.districtId
          };
          var meetingTypeObj={
            typename:data.meetingTypeName,
            meetingtypeid:data.meetingTypeId
          };
          var sponsorData={
            sponsorid:data.sponsorid,
            sponsorname:data.sponsorname,
            phone:data.sponsortel
          };
          var date=[data.meetingtime*1000,data.endtime*1000];
          this.form.meetingtitle=data.meetingtitle;
          this.form.provinceObj=provinceObj;
          this.form.cityObj=cityObj;
          this.form.areaObj=areaObj;
          this.form.specificsite=data.specificsite;
          this.form.meetingurl=data.meetingurl;
          this.bannerUrl=this.formatImg(data.meetingurl);
          this.form.date=date;
          this.form.numberpeople=data.numberpeople;
          this.form.cost=data.cost;
          this.form.deadlinetime=data.deadlinetime*1000;
          this.form.isDel=data.isDel+'';
          this.form.meetingTypeObj=meetingTypeObj;
          this.form.sponsorData=sponsorData;
          this.lecturerList=data.meetingLecturer;
          this.ueditor.ready(()=> {
            this.ueditor.setContent(data.meetingdetails);
          })
          if(data.meetingConfig){
            this.form.meetingLevel=data.meetingConfig.meetingLevel+'';
            if(this.form.meetingLevel>0){
              this.form.openPower='1';
            }
            if(data.meetingConfig.meetingRewardPlantLevel){
              this.form.category='2';
            }
            this.form.meetingRewardPlantLevel=data.meetingConfig.meetingRewardPlantLevel+'';
            this.form.meetingFengrunType=data.meetingConfig.meetingFengrunType+'';
            this.form.meetingPlantReward=data.meetingConfig.meetingPlantReward;
            this.form.meetingLecturerReward=data.meetingConfig.meetingLecturerReward;
            this.form.superiorDivision=data.meetingConfig.superiorDivision;
            this.form.meetingDividend=data.meetingConfig.meetingDividend;
          }
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },

    //补全表格图片路径
    formatImg(url){
      return url?tool.imgBaseUrl+'/'+url:'';
    },
    //根据省的id获取市
    getCityList(provinceid){
      this.$get('/backend/user/cityList',{
        provinceid:provinceid
      }).then(r=>{
        if(r.status==0){
          this.cityList=r.data;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //根据市的id获取区或县
    getAreaList(cityid){
      this.$get('/backend/user/areaList',{
        cityid:cityid
      }).then(r=>{
        if(r.status==0){
          this.areaList=r.data;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //省改变则清空市县
    provinceChange(){
      this.getCityList(this.form.provinceObj.provinceid);
      this.form.cityObj='';
      this.form.areaObj='';
    },
    //市改变清空县
    cityChange(){
      this.getAreaList(this.form.cityObj.cityid);
      this.form.areaObj='';
    },

    //banner上传成功
    fileImg(data){
      this.form.meetingurl=data.response.result;
      this.bannerUrl=tool.imgBaseUrl+'/'+data.response.result;
    },
    //删除banner图片
    removeImg(){
      this.form.meetingurl='';
      this.bannerUrl='';
    },
    //获取主办方数据
    getSponsor(data){
      this.selectSponsor=data;
    },
    //获取讲师数据
    getLecturer(data){
      this.selectLecturer=data;
    },
    //确认讲师
    setLecturer(){
      let repeat=false;
      if(!this.selectLecturer){
        this.$message.error('请选择讲师！');
        return;
      }
      //排除重复的id
      for(let i=0;i<this.lecturerList.length;i++){
        if(this.selectLecturer.id==this.lecturerList[i].id){
          repeat=true;
        }
      }
      if(!repeat){
        this.lecturerList.push(this.selectLecturer);
      }else{
        this.$message.error('您已经添加过该讲师');
      }
      this.closeLecturer();
    },
    //确认主办方
    setSponsor(){
      if(!this.selectSponsor){
        this.$message.error('请选择主办方！');
        return;
      }
      this.form.sponsorData=this.selectSponsor;
      this.closeSponsor();
    },
    //关闭主办方弹框
    closeSponsor(){
      this.sponsorVisible=false;
      this.selectSponsor='';
    },
    //关闭讲师弹框
    closeLecturer(){
      this.lecturerVisible=false;
      this.selectLecturer='';
    },
    //删除主办方
    removeSponsor(id){
      this.form.sponsorData='';
    },
    //删除讲师
    removeLecturer(id){
      for(let i=0;i<this.lecturerList.length;i++){
        if(this.lecturerList[i].id==id){
          this.lecturerList.splice(i,1);
        }
      }
    },
    //开启权限
    powerChange(){
      if(this.form.openPower==1){
        this.form.meetinglevel='';
      }else{
        this.form.meetinglevel='';
      }
    },
    //是否升级会议
    categoryChange(){
      if(this.category==2){
        this.form.meetingRewardPlantLevel='';
      }else{
        this.form.meetingRewardPlantLevel='';
      }
    },
    submit(){
      this.$refs['form'].validate(valid=>{
        if(valid){
          var params={};
          params['meetingtitle']=this.form.meetingtitle;
          params['province']=this.form.provinceObj.province;
          params['provinceId']=this.form.provinceObj.provinceid;
          params['city']=this.form.cityObj.city;
          params['cityId']=this.form.cityObj.cityid;
          params['district']=this.form.areaObj.area;
          params['districtId']=this.form.areaObj.areaid;
          params['specificsite']=this.form.specificsite;
          params['meetingurl']=this.form.meetingurl;
          params['meetingtime']=this.form.date[0]/1000;
          params['endtime']=this.form.date[1]/1000;
          params['numberpeople']=this.form.numberpeople;
          params['cost']=this.form.cost;
          params['deadlinetime']=this.form.deadlinetime/1000;
          params['isDel']=this.form.isDel;
          params['meetingTypeName']=this.form.meetingTypeObj.typename;
          params['meetingTypeId']=this.form.meetingTypeObj.meetingtypeid;
          params['sponsorid']=this.form.sponsorData.sponsorid;
          params['sponsorname']=this.form.sponsorData.sponsorname;
          params['sponsortel']=this.form.sponsorData.phone;
          params['meetingLecturer']=this.lecturerList;
          params['meetingdetails']=this.ueditor.getContent();
          //会议配置信息
          var config={};
          config['meetingLevel']=this.form.openPower==0?'0':this.form.meetingLevel;
          config['meetingRewardPlantLevel']=this.form.category==2?this.form.meetingRewardPlantLevel:'0';
          config['meetingFengrunType']=this.form.meetingFengrunType;
          config['meetingPlantReward']=this.form.meetingPlantReward;
          config['meetingLecturerReward']=this.form.meetingLecturerReward;
          if(this.form.meetingFengrunType==1){
            config['superiorDivision']=this.form.superiorDivision;
            config['meetingDividend']=0;
          }else{
            config['meetingDividend']=this.form.meetingDividend;
            config['superiorDivision']=0;
          }
          params['meetingConfig']=config;

          if(this.editId){
            params['meetingid']=this.editId;
          }
          this.$post('/backend/meeting/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              if(this.editId){
                this.$message.success('编辑成功');
              }else{
                this.$message.success('添加成功');
                this.$router.go(-1);
              }
            }else{
              this.$message.error(r.message);
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },












    //获取省
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
          var data = res.data.data;
          if(data){
            that.provinceOptions = data;
            window.sessionStorage.setItem("province",JSON.stringify(data));
          }
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
        this.form.meetingurl = imgUrl()+'/'+this.type+'/'+ data.data.url;
      }
    },//是否开启权限
    openPowerIvent(e){
      if(e!=1){
        this.form.meeting_level = 0;
      }else{
        this.form.meeting_level = '1';
      }
    },//切换会议种类
    categoryOfMeeting(e){
      if(e!=1){
        this.form.meeting_reward_plant_level = '1'
      }else{
        this.form.meeting_reward_plant_level = '0'
      }
    },//选择主办方，调起主办方弹框
    selectTheSponsor(){
      this.dialogVisible2=true;
      this.sponsor(this.sponsorForm);
    },//获取主办方
    sponsor(params){
      var that = this;
      params['token'] = window.sessionStorage.getItem("token");
      params['page'] = that.sponsorPage;
      params['pageSize'] = that.sponsorPageSize;
      axios.post(process.env.API_ROOT+'/sponsor/index', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          var list = res.data.data.list;
          for(var i =0;i<list.length;i++){
            list[i]['sponsorurl'] = imgUrl()+'/'+list[i]['sponsorurl']
          }
          that.sponsorTableData = list;
          that.sponsorPage = res.data.data.pager.page;
          that.sponsorTotal = Number(res.data.data.pager.Counts);
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
    },//选择某个主办方
    sponsorCellClick(e){
      this.sponsorData = e;
    },//清除主办方
    clearSponsor(){
      this.selectSponsor = '';
    },//确定主办方
    sponsorBtn(){
      var sponsor=this.selectSponsor=this.sponsorData;
      if(!sponsor){
        this.$message("请选择主办方");
        return;
      }else{
        this.dialogVisible2 = false;
      }
    },//主办方分页'每页/当前页'
    sponsorHandleSizeChange(val) {
      this.sponsorPageSize = val;
      this.sponsor(this.sponsorForm);
    },
    sponsorHandleCurrentChange(val) {
      this.sponsorPage = val;
      this.sponsor(this.sponsorForm);
    },//按条件搜索主办方
    sponsorOnSubmit(){
      this.sponsor(this.sponsorForm);
    },//讲师分页'每页/当前页'
    handleSizeChange(val) {
      this.lecturePageSize = val;
      this.lecturer(this.lecturerForm);
    },
    handleCurrentChange(val) {
      this.lecturePage = val;
      this.lecturer(this.lecturerForm);
    },//按条件搜索讲师
    lecturerOnSubmit(){
      this.lecturer(this.lecturerForm)
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },//选择讲师，调起讲师弹框
    selectTheLecture(){
      this.dialogVisible=true;
      this.lecturer(this.lecturerForm);
    },//讲师数据
    lecturer(params){
      var that = this;
      params['token'] = window.sessionStorage.getItem("token");
      params['page'] = that.lecturePage;
      params['pageSize'] = that.lecturePageSize;
      axios.post(process.env.API_ROOT+'/lecturer/index', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          var list = res.data.data.list;
          for(var i = 0;i<list.length;i++){
            list[i]['lecturer_picture'] = imgUrl()+"/"+list[i]['lecturer_picture']
          }
          that.lecturerTableData = list;
          that.lecturePage = res.data.data.pager.page;
          that.lectureTotal = Number(res.data.data.pager.Counts);
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
    },//选择讲师
    lecturerSelect(e){
      for(var i =0;i<e.length;i++){
        if(JSON.stringify(this.lectureArr).indexOf(JSON.stringify(e[i]))==-1){
          this.lectureArr.push(e[i])
        }
      }
    },//确定讲师
    lectureBtn(){
      var lecture=this.lectureArr;
      var data = this.lecturerData;
      if(!lecture){
        this.$message("请选择讲师");
        return;
      }else{
        for(var i=0;i<lecture.length;i++){
          lecture[i]['lecture_details'] = lecture[i]['lecturer_details']
          delete lecture[i]['lecturer_details'];
          if(JSON.stringify(data).indexOf(JSON.stringify(lecture[i]))==-1){
            this.lecturerData.push(lecture[i])
          }
        }
        this.dialogVisible = false
        this.lectureArr = [];
      }
    },//删除讲师
    delLecture(idx){
      var data = this.lecturerData;
      data.splice(idx,1);
      this.lecturerData = data;
    },
    cancelBtn(){
      this.dialogVisible2 = false;
      this.dialogVisible = false;
      this.sponsorData = '';
      this.selectLecture = ''
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
          var data = res.data.data.list;
          that.MeetingTypeList = data;
          window.sessionStorage.setItem("MeetingTypeList",JSON.stringify(data))
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
    getMeetingDetail(){
      var params = {},that = this;
        params['id'] = this.$route.query.id;
        params['token'] = window.sessionStorage.getItem("token");
      axios.post(process.env.API_ROOT+'/meeting/detail', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status = res.data.status;
        if(status==0){
          var meetingConent = res.data.data.meetingConent;
            that.form.id = meetingConent.meetingid;
            that.form.meeting_type_id = meetingConent.meeting_type_id;
            that.form.meetingtitle = meetingConent.meetingtitle
            that.form.district = meetingConent.district;
            that.form.district_id = meetingConent.district_id;
            that.form.specificsite = meetingConent.specificsite
            that.form.cost = meetingConent.cost
            that.form.latitude = meetingConent.latitude
            that.form.longitude = meetingConent.longitude
            that.form.start = meetingConent.start;
            that.form.numberpeople = meetingConent.numberpeople;
            that.form.meetingdetails = meetingConent.meetingdetails;
            that.form.meetingurl = imgUrl()+"/"+ meetingConent.meetingurl;
            that.imgLink = imgUrl()+"/"+meetingConent.meetingurl;
            that.provinceInfo = meetingConent.province_id+"*"+meetingConent.province;
            if(that.provinceInfo){
              var province_id = that.provinceInfo.split("*")[0];
              var province = that.provinceInfo.split("*")[1];
              that.form.province_id = province_id;
              that.form.province = province;
              that.getCity(province_id)
            }
            that.cityInfo = meetingConent.city_id+"*"+meetingConent.city;
            if(that.cityInfo){
              var city_id = that.cityInfo.split("*")[0];
              var city = that.cityInfo.split("*")[1];
              that.form.city_id = city_id;
              that.form.city = city;
              that.getArea(city_id)
            }

            that.form.deadlinetime = meetingConent.deadlinetime*1000;
            that.date = [meetingConent.meetingtime*1000,meetingConent.endtime*1000];
            that.districtInfo = meetingConent.district_id+"*"+meetingConent.district;
            // 主办方信息
            var sponsorname = meetingConent.sponsorname;
            var sponsorid = meetingConent.sponsorid;
            var sponsortel = meetingConent.sponsortel;
            var sponsor_url = imgUrl()+"/"+ meetingConent.sponsor_url;
            that.selectSponsor = {
              sponsorid:sponsorid,
              sponsorname:sponsorname,
              phone:sponsortel,
              sponsorurl:sponsor_url
            }
          var meetingConfig = res.data.data.meetingConfig;
            that.form.meeting_plant_reward = meetingConfig.meeting_plant_reward;//平台抽成比例
            that.form.meeting_lecturer_reward = meetingConfig.meeting_lecturer_reward//讲师抽成比例
            that.form.meeting_dividend = meetingConfig.meeting_dividend;//会议红利比例
            that.form.superior_division = meetingConfig.superior_division;//上级分润比例
            that.form.meeting_fengrun_type = meetingConfig.meeting_fengrun_type.toString();
            var meeting_level = meetingConfig.meeting_level;
            if(meeting_level!=0){
              that.open_power = '1';
            }
            that.form.meeting_level = meeting_level;
            var meeting_reward_plant_level = meetingConfig.meeting_reward_plant_level;
            if(meeting_reward_plant_level!=0){
              that.category = '2'
            }
            that.form.meeting_reward_plant_level = meeting_reward_plant_level;
            var lecturer = res.data.data.meetingLecturer?res.data.data.meetingLecturer:[];//讲师信息
            for(var i =0;i<lecturer.length;i++){
              lecturer[i]['lecturer_picture'] = imgUrl()+"/"+lecturer[i]['lecturer_url']
              delete lecturer[i]['lecturer_url'];
            }
            that.lecturerData = lecturer;//讲师信息
            that.meetingdetails = meetingConent.meetingdetails
            that.ueditor.ready(function() {
              that.ueditor.setContent(meetingConent.meetingdetails);//富文本输入框内容
            });
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
    onSubmitForm(){
      var params = this.form,that = this;
      params['sponsor_id']=that.selectSponsor.sponsorid;
      params['sponsor_name']=that.selectSponsor.sponsorname;
      params['sponsor_phone']=that.selectSponsor.phone;
      params['meetingtime'] = Date.parse(that.timeConverter(that.date[0]/1000));
      params['endtime'] =Date.parse(that.timeConverter(that.date[1]/1000));
      params['deadlinetime'] = Date.parse(that.timeConverter(params['deadlinetime']/1000));
      params['meetingdetails'] = that.ueditor.getContent();
      params['meetingurl'] = params['meetingurl'].split("/")[3]+"/"+params['meetingurl'].split("/")[4];
      if(this.category==1){
        params['meeting_reward_plant_level'] = 0;
      }
      if(this.open_power==0){
        params['meeting_level'] = 0;
      }
      var lecture = that.lecturerData;
      for(var i = 0;i<lecture.length;i++){
        lecture[i]['lecturer_url'] = lecture[i]['lecturer_picture'].split("/")[3]+"/"+lecture[i]['lecturer_picture'].split("/")[4]
        lecture[i]['lecturer_details'] = lecture[i]['lecture_details']
        delete lecture[i]['lecturer_picture'];
        delete lecture[i]['lecture_details'];
      }
      params['lecturerlist'] = JSON.stringify(lecture)
      params['token'] = window.sessionStorage.getItem("token");
      delete params['lecture'];
      axios.post(process.env.API_ROOT+'/meeting/UpdateMeeting', qs.stringify(params),{
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
          that.$router.push('/meetingList');
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'warning'
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

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.editMeeting-page{
  .form{
    width: 60%;
    min-width: 600px;
  }
  .unit-text{
    padding-left:10px;
  }
  .select-ul {
    overflow: hidden;
    .select-li {
      float: left;
      width: 32%;
      margin-right: 2%;
      &:last-child {
        margin-right: 0px;
      }
    }
  }
  .short-input{
    width: 80px;
  }

  .show-item{
    width: 100%;
    height: 40px;
    background: #f5f5f5;
    margin:0 0 4px;
    position: relative;
    vertical-align: middle;
    .icon{
      width: 30px;
      height:30px;
      position: absolute;
      right:50px;
      top:5px;
    }
    span{
      margin-left: 10px;
      display: inline-block;
      height: 40px;
      line-height: 40px;
    }
    .el-icon-circle-close-outline{
      cursor: pointer;
      position: absolute;
      right:12px;
      top:0;
      line-height:40px;
      font-size:16px;
      color: #999;
      &:hover{
        color: #000;
      }
    }
  }



  .scroller{
    height:60vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
  /*img.img{
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
    vertical-align: middle;
  }
  .sponsorBg span{
    margin-left: 10px;
    display: inline-block;
    height: 40px;
    line-height: 40px;
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
  img.lecture{
    width: 65px;
    height: 38px;
    vertical-align: middle;
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
  img.imgC{
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }*/
</style>
