<template>
  <div class="basic-page">
    <el-form ref="base_info" :model="base_info" label-width="120px">
      <span class="title">基础设置</span><el-button size='medium' @click='editInfo(base_info,"base_info")' v-if='editIsShow'>修改</el-button>
      <el-row>
        <el-col :span="12">
          <el-form-item label="分享主题：">
            <el-input v-model="base_info.base_share_title"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分享描述：">
            <el-input v-model="base_info.base_share_desc"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="邀请好友页面：">
            <el-input v-model="base_info.share_Bg"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="会员中心页面：">
            <el-input v-model="base_info.base_member_center_page"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="关于我们页面：">
            <el-input v-model="base_info.base_about_our_page"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="APP的版本号：">
            <el-input v-model="base_info.base_app_version"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="IOS下载地址：">
            <el-input v-model="base_info.base_apple_download_address"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Android下载：">
            <el-input v-model="base_info.base_android_download_address"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form ref="user_role_view" :model="user_role_view" label-width="120px">
      <hr/>
      <span class="title">App端角色名称</span><el-button size='medium' @click='editInfo(user_role_view,"user_role_view")' v-if='editIsShow'>修改</el-button>
      <el-row>
        <el-col :span="6">
          <el-form-item label="普通会员：">
            <el-input v-model="user_role_view.level_0"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="VIP会员：">
            <el-input v-model="user_role_view.level_1"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="弟子合伙人：">
            <el-input v-model="user_role_view.level_2"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创业合伙人：">
            <el-input v-model="user_role_view.level_3"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="院长合伙人：">
            <el-input v-model="user_role_view.level_4"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="区代：">
            <el-input v-model="user_role_view.user_level_district_generation"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="市代：">
            <el-input v-model="user_role_view.user_level_city_generation"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="省代：">
            <el-input v-model="user_role_view.user_level_provincial_generation"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form ref="division_members" :model="division_members" label-width="120px">
      <hr/>
      <span class="title">会员分润设置</span><el-button size='medium' @click='editInfo(division_members,"division_members")' v-if='editIsShow'>修改</el-button>
      <el-row style='margin-bottom: 20px;'>
        <el-col :span="4" class='mgr10 txc' :offset="2" >升级条件</el-col>
        <el-col :span="4" class='mgr10 txc'>一级【直推】%</el-col>
        <el-col :span="4" class='mgr10 txc'>二级【间推】%</el-col>
        <el-col :span="4" class='mgr10 txc'>会员红利%</el-col>
        <el-col :span="4" class='mgr10 txc'>赠送激活码数量</el-col>
      </el-row>
      <el-row>
        <el-col :span="2">
          <el-form-item label="普通会员分润："></el-form-item>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.upgrading_conditions_lv0"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.direct_push_profit_lv0"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.inter_push_profit_lv0"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.membership_bonus_lv0"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.grant_number_activation_codes_lv0"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="2">
          <el-form-item label="VIP会员分润："></el-form-item>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.upgrading_conditions_lv1"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.direct_push_profit_lv1"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.inter_push_profit_lv1"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.membership_bonus_lv1"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.grant_number_activation_codes_lv1"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="2">
          <el-form-item label="弟子合伙分润："></el-form-item>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.upgrading_conditions_lv2"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.direct_push_profit_lv2"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.inter_push_profit_lv2"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.membership_bonus_lv2"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.grant_number_activation_codes_lv2"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="2">
          <el-form-item label="创业合伙分润："></el-form-item>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.upgrading_conditions_lv3"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.direct_push_profit_lv3"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.inter_push_profit_lv3"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.membership_bonus_lv3"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.grant_number_activation_codes_lv3"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="2">
          <el-form-item label="院长合伙分润："></el-form-item>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.upgrading_conditions_lv4"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.direct_push_profit_lv4"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.inter_push_profit_lv4"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.membership_bonus_lv4"></el-input>
        </el-col>
        <el-col :span="4" class='mgr10'>
          <el-input v-model="division_members.grant_number_activation_codes_lv4"></el-input>
        </el-col>
      </el-row>
    </el-form>
    <el-form ref="separate_setting" :model="separate_setting" label-width="120px">
      <hr/>
      <span class="title">代理商分润设置</span><el-button size='medium' @click='editInfo(separate_setting,"separate_setting")' v-if='editIsShow'>修改</el-button>
      <el-row>
        <el-col :span="6">
          <el-form-item label="区代分润：">
            <el-input v-model="separate_setting.separate_zone_generation"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="市代分润：">
            <el-input v-model="separate_setting.separate_city_generation"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="省代分润：">
            <el-input v-model="separate_setting.separate_provincial_generation"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form ref="conference_division" :model="conference_division" label-width="120px">
      <hr/>
      <span class="title">会议基础分润设置</span><el-button size='medium' @click='editInfo(conference_division,"conference_division")' v-if='editIsShow'>修改</el-button>
      <el-row>
        <el-col :span="6">
          <el-form-item label="平台抽成比例：">
            <el-input v-model="conference_division.flat_lift_ratio"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="讲师抽成比例：">
            <el-input v-model="conference_division.lecturer_proportionate"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="会员红利比例：">
            <el-input v-model="conference_division.dividend_ratio"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="分润冻结天数：">
            <el-input v-model="conference_division.fractional_freezing_days"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="讲师跟踪奖励：">
            <el-input v-model="conference_division.lecturer_tracking_reward"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form ref="present_setting" :model="present_setting" label-width="120px">
      <hr/>
      <span class="title">提现设置</span><el-button size='medium' @click='editInfo(present_setting,"present_setting")' v-if='editIsShow'>修改</el-button>
      <el-row>
        <el-col :span="6">
          <el-form-item label="提现最低金额：">
            <el-input v-model="present_setting.raise_minimum_amount"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="21">
              <el-form-item label="提现手续费：">
                <el-input v-model="present_setting.bill_charge"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="2" :offset='1'>
              <i style="height: 40px;line-height: 40px;display: inline-block;">%</i>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
  import tool from '@/vendor/tool'
export default {
  name: 'basicSetting',
  components:{

  },
  data () {
    return {
      base_info:{
        "base_share_title":"",
        "base_share_desc":"",
        "share_Bg":"",
        "base_member_center_page":"",
        "base_about_our_page":"",
        "base_app_version":"",
        "base_apple_download_address":"",
        "base_android_download_address":""
      },
      user_role_view:{
        "level_0":"",
        "level_1":"",
        "level_2":"",
        "level_3":"",
        "level_4":"",
        "user_level_district_generation":"",
        "user_level_city_generation":"",
        "user_level_provincial_generation":""
      },
      division_members:{
        "upgrading_conditions_lv0":"",
        "direct_push_profit_lv0":"",
        "inter_push_profit_lv0":"",
        "membership_bonus_lv0":"",
        "grant_number_activation_codes_lv0":"",
        "upgrading_conditions_lv1":"",
        "direct_push_profit_lv1":"",
        "inter_push_profit_lv1":"",
        "membership_bonus_lv1":"",
        "grant_number_activation_codes_lv1":"",
        "upgrading_conditions_lv2":"",
        "direct_push_profit_lv2":"",
        "inter_push_profit_lv2":"",
        "membership_bonus_lv2":"",
        "grant_number_activation_codes_lv2":"",
        "upgrading_conditions_lv3":"",
        "direct_push_profit_lv3":"",
        "inter_push_profit_lv3":"",
        "membership_bonus_lv3":"",
        "grant_number_activation_codes_lv3":"",
        "upgrading_conditions_lv4":"",
        "direct_push_profit_lv4":"",
        "inter_push_profit_lv4":"",
        "membership_bonus_lv4":"",
        "grant_number_activation_codes_lv4":""
      },
      separate_setting:{
          "separate_zone_generation":"",
          "separate_city_generation":"",
          "separate_provincial_generation":""
      },
      conference_division:{
        "flat_lift_ratio":"",
        "lecturer_proportionate":"",
        "dividend_ratio":"",
        "fractional_freezing_days":"",
        "lecturer_tracking_reward":""
      },
      present_setting:{
        "raise_minimum_amount":"",
        "bill_charge":""
      },
    }
  },
  computed:{
    editIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
  },
  mounted:function(){
    this.getData();
  },
  methods:{
    getData(){
      this.loading=true;
      this.$get('/backend/adminSetting/getAdminSetting').then(r=>{
        this.loading=false;
        if(r.status==0){
          for(let i in this.base_info){
            if(i in r.data){
              this.base_info[i]=r.data[i];
            }
          }
          for(let i in this.user_role_view){
            if(i in r.data){
              this.user_role_view[i]=r.data[i];
            }
          }
          for(let i in this.division_members){
            if(i in r.data){
              this.division_members[i]=r.data[i];
            }
          }
          for(let i in this.separate_setting){
            if(i in r.data){
              this.separate_setting[i]=r.data[i];
            }
          }
          for(let i in this.conference_division){
            if(i in r.data){
              this.conference_division[i]=r.data[i];
            }
          }
          for(let i in this.present_setting){
            if(i in r.data){
              this.present_setting[i]=r.data[i];
            }
          }
        }
      })
    },
    //修改个人信息
    editInfo(params,key){
      var tips,
          reg = /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/;
      //params['token'] = window.sessionStorage.getItem("token");
      params['key'] = key;
      if(key == 'conference_division'){
        if(params['dividend_ratio']>100){
          this.$message({
            showClose: true,
            message: '会员红利比例不能大于100',
            type: 'warning'
          });
          return;
        }
        if(params['flat_lift_ratio']>100){
          this.$message({
            showClose: true,
            message: '平台抽成比例不能大于100',
            type: 'warning'
          });
          return;
        }
        if(params['lecturer_proportionate']>100){
          this.$message({
            showClose: true,
            message: '讲师抽成比例不能大于100',
            type: 'warning'
          });
          return;
        }
        if(params['lecturer_tracking_reward']>100){
          this.$message({
            showClose: true,
            message: '讲师跟踪奖励不能大于100',
            type: 'warning'
          });
          return;
        }
      };
      if(key == 'base_info'){
        if(!reg.test(params['share_Bg'])){
          this.$message({
            showClose: true,
            message: '邀请好友页面请填写正确的地址',
            type: 'warning'
          });
          return
        }
        if(!reg.test(params['base_member_center_page'])){
          this.$message({
            showClose: true,
            message: '会员中心页面请填写正确的地址',
            type: 'warning'
          });
          return
        }
        if(!reg.test(params['base_about_our_page'])){
          this.$message({
            showClose: true,
            message: '关于我们页面请填写正确的地址',
            type: 'warning'
          });
          return
        }
        if(!reg.test(params['base_apple_download_address'])){
          this.$message({
            showClose: true,
            message: 'IOS下载地址请填写正确的地址',
            type: 'warning'
          });
          return
        }
        if(!reg.test(params['base_android_download_address'])){
          this.$message({
            showClose: true,
            message: 'Android下载请填写正确的地址',
            type: 'warning'
          });
          return
        }
      }
      switch(key)
      {
      case 'base_info':
        tips = '基础设置';
        break;
      case 'user_role_view':
        tips = 'App端角色名称';
        break;
      case 'division_members':
        tips = '会员分润设置';
        break;
      case 'separate_setting':
        tips = '代理商分润设置';
        break;
      case 'conference_division':
        tips = '会议基础分润设置';
        break;
      case 'present_setting':
        tips = '提现设置';
        break;
      default:
        tips = '';
      }
      this.$confirm('此操作将修改"'+tips+'"模块, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$post('/backend/adminSetting/updateByKey',params).then(r=>{
            if(r.status==0){
              this.$message.success('修改成功!');
            }else{
              this.$message.error(r.message);
            }
          }).catch(err=>{
            this.$message.error(r.message);
          })
        }).catch(() => {
          this.$message.info('已取消修改');
        });
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .basic-page{
    .title{
      padding:0 20px;
      height: 36px;
      line-height: 36px;
      display: inline-block;
      border-radius: 4px;
      font-size: 14px;
      margin-bottom: 20px;
      background: #409EFF;
      color: #fff;
      margin-right: 10px;
    }
    .mgr10{
      margin-right: 10px;
    }
    .txc{
      text-align: center;
    }
  }
</style>

