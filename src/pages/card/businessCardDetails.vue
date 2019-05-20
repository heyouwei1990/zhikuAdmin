<template>
  <div class="businessCardDetail-page">
    <el-form ref="infoForm" :model="infoForm" :rules="rules" label-width="80px" v-loading="loading">
      <el-button size='mini' class="title">基本资料</el-button>
      <p></p>
      <el-form-item label="名片名字" prop="cardName">
        <el-input v-model="infoForm.cardName"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="cardPhone">
        <el-input v-model="infoForm.cardPhone"></el-input>
      </el-form-item>
      <el-form-item label="现任职务" prop="cardDuty">
        <el-input v-model="infoForm.cardDuty"></el-input>
      </el-form-item>
      <el-form-item label="公司名称" prop="cardCompany">
        <el-input v-model="infoForm.cardCompany"></el-input>
      </el-form-item>
      <el-form-item label="所在城市" prop="city">
        <el-input v-model="infoForm.city"></el-input>
      </el-form-item>
      <el-form-item label="具体位置" prop="specificLocation">
        <el-input v-model="infoForm.specificLocation"></el-input>
      </el-form-item>
      <el-form-item label="资源标签" prop="type">
        <!--<el-input v-model="infoForm.type"></el-input>-->
        <el-checkbox-group v-model="infoForm.type">
          <el-checkbox v-for="item in cardTypes" :label="item.id" :key="item.id">{{item.name}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="名片logo" prop="cardLogo">
        <img :src="infoForm.cardLogo" class="logo">
      </el-form-item>
      <el-form-item label="个人简介">
        <el-input v-model="infoForm.cardMassage" type='textarea'></el-input>
      </el-form-item>
      <hr/>
      <el-button size='mini' class="title">个人秀</el-button>
      <el-row :gutter="20">
        <el-col :span="4" v-for='(item,index) in myShow' :key='index'>
          <img :src="item" class="personal">
        </el-col>
      </el-row>
      <hr/>
      <el-button size='mini' class="title">产品展示</el-button>
      <div style="overflow: hidden;">
        <div class="product_box" v-for='item in commodity'>
          <router-link to='productDetails?id=3'>
            <img :src="item.minification_url">
            <div class="product_info">
              <p class="product_name">
                <strong>产品简称：</strong>{{item.abbreviation}}
              </p>
              <p style="margin-top:5px;clear: both;">
                <span><strong>产品产地：</strong>{{item.place_of_origin}}</span>
                <span><strong>价格：</strong>{{item.price}}</span>
              </p>
            </div>
          </router-link>
        </div>
      </div>
      <hr/>
      <el-button size='mini' class="title">审核状态</el-button>
      <el-row>
        <el-col>
          <el-form-item label="名片状态">
             <el-select v-model="infoForm.isDel" @change="setStatus">
              <el-option v-for="(item,index) in cardStatus" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="下架原因" prop="delMessage" style='width:400px;'>
            <el-input v-model="infoForm.delMessage" :disabled="!infoForm.isDel" type='textarea' autosize placeholder="请输入下架原因" ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <router-link to='businessCard'>
        <el-button type='danger' style='margin-left: 120px;'>返回</el-button>
      </router-link>
      <el-button type='primary' @click='submit'>确定</el-button>
    </el-form>
  </div>
</template>

<script>
  import tool from '@/vendor/tool'
  import {mapActions,mapState} from 'vuex'
export default {
  data () {
    var validateReason=(rule,value,callback)=>{
      if(this.infoForm.isDel==1 && !this.infoForm.delMessage){
        callback(new Error('请输入下架原因'))
      }else{
        callback();
      }
    };
    return {
      loading:false,
      itemId:'',
      infoForm:{
        cardName:'',
        cardPhone:'',
        cardDuty:'',
        cardCompany:'',
        city:'',
        specificLocation:'',
        type:'',
        cardLogo:'',
        cardMassage:'',
        isDel:0,
        delMessage:'',
        myShow:'',
      },
      myShow:[],
      commodity:[],
      cardStatus:[
        {label:'上架',value:0},
        {label:'下架',value:1}
      ],
      rules:{
        delMessage:[{validator: validateReason, trigger: 'blur'}],
        cardName:[{required:true, message: '请输入名片名字', trigger: 'blur'}],
        cardPhone:[{required:true, message: '请输入手机号', trigger: 'blur'}],
        cardDuty:[{required:true, message: '请输入现任职务', trigger: 'blur'}],
        cardCompany:[{required:true, message: '请输入公司名称', trigger: 'blur'}],
        city:[{required:true, message: '请输入所在城市', trigger: 'blur'}],
        specificLocation:[{required:true, message: '请输入具体位置', trigger: 'blur'}],
        type:[{required:true, message: '请选择资源标签', trigger: 'blur'}],
        cardLogo:[{required:true, message: '请输入名片LOGO', trigger: 'blur'}],
      }
    }
  },
  created(){
    this.itemId=this.$route.query.id;
    if(this.cardTypes.length==0){
      this.$store.dispatch('getCardTypes');
    }
  },
  computed:{
    ...mapState({
      cardTypes:state=>state.cardTypes,
    })
  },
  mounted(){
    this.getData();
  },
  methods:{
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/userCard/getById',{
        id:this.itemId
      }).then(r=>{
        if(r.status==0){
          for(let i in this.infoForm){
            this.infoForm[i]=r.data[0][i];
          }
          //type变数组
          this.infoForm.type=r.data[0].type.split(',').map(function (item) {
            return parseInt(item);
          });
          this.infoForm.cardLogo=!r.data[0].cardLogo?'':tool.imgBaseUrl+'/'+r.data[0].cardLogo;
          this.infoForm.isDel=r.data[0].isDel==true?1:0;
          var imgList=r.data[0].myShow.split(',');
          for(let i=0;i<imgList.length;i++){
            this.myShow.push(tool.imgBaseUrl+'/'+imgList[i]);
          }
        }
        this.loading=false;
      }).catch(err=>{
        this.loading=false;
        this.$message.error(err.message)
      })
    },
    //切换状态
    setStatus(){
      if(this.infoForm.isDel==0){
        this.infoForm.delMessage='';
      }
    },
    //提交
    submit(){
      this.$refs["infoForm"].validate(valid=>{
        var params={
          ...this.infoForm
        };
        params['type']=this.infoForm.type.join(',');
        params['id']=this.itemId;
        params.cardLogo=this.infoForm.cardLogo.replace(tool.imgBaseUrl+'/','');
        if(valid){
          this.$post('/backend/userCard/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              this.$message.success('保存成功！');
            }
          }).catch(err=>{
            this.$message.error(err.message)
          })
        }
      })

    },
    /*updatecard(item){
      var params = {
        token:window.sessionStorage.getItem("token"),
        id:item.id,
        del_message:this.del_message,
        is_del:this.is_del
      }
      var that =this;
      axios.post(process.env.API_ROOT+'/userCard/updatecard', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.$message({
            showClose: true,
            message: '更新成功',
            type: 'success'
          });
          that.$router.push({path: '/businessCard'});
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
        that.loading = false
      })
      .catch(function(err){

      });
    },
    getStorage(){
      var rules = window.sessionStorage.getItem("rules");
      if(rules == '*'){
        this.editIsShow = true;
        return;
      }
      var menuList = JSON.parse(window.sessionStorage.getItem("menuList"));
      for(var i = 0;i < menuList.length;i++){
        if(rules.indexOf(menuList[i]['id'])!=-1){
          if(menuList[i]['action_id']=='user/updatecardstatus'){
            if(menuList[i]['show_button']==1){
              this.editIsShow = true;
            }else{
              this.editIsShow = false;
            }
          }
        }
      }
    }*/
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .businessCardDetail-page{
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
    .logo{
      display: block;
      width: 100px;
      height:100px;
    }
    img.personal{
      width: 100%;
      height: 100%;
    }
    .mgr10{
      margin-right: 10px;
    }
    .txc{
      text-align: center;
    }
    .product_box{
      width: 270px;
      height: 65px;
      border:1px solid #ccc;
      border-radius: 5px;
      padding:5px;
      overflow: hidden;
      font-size: 14px;
      float: left;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    .product_box a{
      color: #000;
    }
    .product_box img{
      width: 65px;
      height: 65px;
      float: left;
    }
    .product_info{
      width: 190px;
      height: 65px;
      overflow: hidden;
      float: left;
      margin-left: 10px;
    }
    .product_name{
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    hr{
      margin:20px 0;
    }
    .el-checkbox{
      margin-left:0;
      margin-right:30px;
    }
  }
</style>
