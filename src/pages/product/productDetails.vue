<template>
  <div class="productDetail-page">
    <el-form ref="baseInfo" label-width="80px" v-loading="loading" >
      <el-button size='mini' class="title">基本资料</el-button>
      <p></p>
      <el-form-item label="简称">
        <el-input v-model="baseInfo.abbreviation" placeholder='简称' disabled></el-input>
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="baseInfo.name" placeholder='名称' disabled></el-input>
      </el-form-item>
      <el-form-item label="分类">
        <el-input v-model="baseInfo.typeName" placeholder='分类' disabled></el-input>
      </el-form-item>
      <el-form-item label="产地">
        <el-input v-model="baseInfo.placeOfOrigin" placeholder='产地' disabled></el-input>
      </el-form-item>
      <el-form-item label="价格">
        <el-input v-model="baseInfo.price" placeholder='价格' disabled></el-input>
      </el-form-item>
      <el-form-item label="缩略图">
        <img :src="baseInfo.minificationUrl" class="avatar">
      </el-form-item>
      <el-form-item label="简介">
        <el-input v-model="baseInfo.intro" type='textarea' autosize placeholder='产品简介' disabled></el-input>
      </el-form-item>
      <hr/>
      <el-button size='mini' class="title">产品规格</el-button>
      <el-row type="flex" class="row-bg" justify="space-around" v-for='(item,index) in specifications' :key='index' v-if="specifications.length>0">
        <el-col :span="8">
          <el-form-item label="规格名称">
            <el-input v-model="item.name" placeholder='规格名称' disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="对应价格">
            <el-input v-model="item.price" placeholder='对应价格' disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <hr/>
      <el-button size='mini' class="title">产品轮播</el-button>
      <el-row :gutter="20">
        <el-col :span="4" v-for='(item,index) in bannerList' :key='index' v-if="bannerList.length>0">
          <img :src="item.url" class="personal">
        </el-col>
      </el-row>
      <hr/>
      <el-button size='mini' class="title">产品详情</el-button>
      <el-row>
        <el-col :span='24'>
          <div id="ueditors" type="text/plain" style="width: 90%;"></div>
        </el-col>
      </el-row>
      <el-row class="tac">
        <el-button type='danger' class="btn-back" @click='$router.go(-1)'>返回</el-button>
      </el-row>

    </el-form>
  </div>
</template>

<script>
  import '../../../static/UE/ueditor.config';
  import '../../../static/UE/ueditor.all';
  import '../../../static/UE/ueditor.parse';
  import tool from '@/vendor/tool'
export default {
  name: 'businessCard',
  data () {
    return {
      uid:null,
      loading:false,
      status:'0',
      remark:'',
      ueditor:'',
      bannerList:[],
      baseInfo:{
        abbreviation:'',
        name:'',
        typeName:'',
        placeOfOrigin:'',
        price:'',
        minificationUrl:'',
        intro:''
      },
      specifications:[]
    }
  },
  mounted(){
    this.uid=this.$route.query.id;
    this.ueditor=UE.delEditor('ueditors');
    this.ueditor = UE.getEditor('ueditors',{
      BaseUrl: '',
      UEDITOR_HOME_URL: 'static/UE/',
    });
    this.ueditor.ready(()=> {
      this.ueditor.setHeight(400);
    })
   this.getData();
  },
  methods:{
    getData(){
      this.loading=true;
      this.$get('/backend/commodity/getById',{
        id:this.uid
      }).then(r=>{
        this.loading=false;
        if(r.status==0){
          for(let i in this.baseInfo){
            this.baseInfo[i]=r.data[i];
          }
          this.baseInfo.minificationUrl=tool.imgBaseUrl+'/'+r.data.minificationUrl;
          let imgs=!r.data.commodityBannerList?[]:r.data.commodityBannerList;
          for (let i=0;i<imgs.length;i++){
            imgs[i].url=tool.imgBaseUrl+'/'+imgs[i].url;
          }
          this.bannerList=imgs;
          this.specifications=!r.data.commoditySpecificationsList?[]:r.data.commoditySpecificationsList;
          this.ueditor.ready(()=> {
            this.ueditor.setContent(r.data.details);
          })
        }
      }).catch(err=>{
        this.loading=false;
        this.$message.error(err.message);
      })
    }
  },
  destroyed() {
    this.ueditor.destroy();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .productDetail-page{
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
    .avatar{
      width: 200px;
    }
    hr{
      margin:20px 0;
    }
    .personal{
      width: 100%;
    }
    .tac{
      text-align: center;
    }
    .btn-back{
      width: 100px;
      margin-left:-120px;
      margin-top:50px;
    }
    .el-textarea.is-disabled .el-textarea__inner,
    .el-input.is-disabled .el-input__inner{
      background-color: #fff;
      color: #666;
    }
  }
</style>
