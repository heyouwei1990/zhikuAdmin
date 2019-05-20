<template>
    <div>
      <el-form :model="form" :rules="rules" ref="articleForm" label-width="100px" style="margin:20px;width:60%;min-width:600px;">
        <el-button type="primary" size='mini' class="title">基本资料</el-button>
        <br>
        <el-form-item label="文章名称" prop="title">
          <el-input v-model="form.title" clearable placeholder='请填写文章名称'></el-input>
        </el-form-item>
        <el-form-item label="文章缩略图" prop="icon">
          <uploader
            :fileName="fileName1"
            @success="fileCover"
            @remove="removeCover"
            :image="iconUrl"
          ></uploader>
          <!--<el-button type="danger" size='mini'>删除</el-button>-->
        </el-form-item>
        <el-form-item label="文章来源" prop="author">
          <el-input v-model="form.author" clearable placeholder='请填写文章来源'></el-input>
        </el-form-item>
        <el-form-item label="文章分类" prop="categId">
          <el-select v-model="form.categId">
            <el-option v-for="(item,index) in typeList" :key="index" :label="item.text" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文章浏览量">
          <el-input v-model="form.browseCnt" clearable placeholder='请填写文章浏览量'></el-input>
        </el-form-item>
        <el-form-item label="文章点赞量">
          <el-input v-model="form.likeCnt" clearable placeholder='请填写文章点赞量'></el-input>
        </el-form-item>
        <hr>
        <el-button type="primary" size='mini' class="title">文章详情</el-button>
        <el-form-item label="">
          <div id="editor" style="height: 500px;"></div>
          <!--<script id="editor" type="text/plain" ></script>-->
        </el-form-item>
        <el-form-item label="文章广告图">
          <uploader
            :fileName="fileName2"
            @success="fileBanner"
            @remove="removeBanner"
            :image="bannerUrl"
          ></uploader>
        </el-form-item>
        <el-form-item label="广告链接">
          <el-input v-model="form.bannerUrl" clearable placeholder='链接商品详情ID'></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit('articleForm')">确定</el-button>
        </el-form-item>
      </el-form>
    </div>
</template>

<script>
  import uploader from '@/components/uploader'
  import '../../../static/UE/ueditor.config';
  import '../../../static/UE/ueditor.all';
  import '../../../static/UE/ueditor.parse';
  import tool from '@/vendor/tool'
  export default {
    components:{
      uploader
    },
    data(){
      return{
        fileName1:'articleCover',
        fileName2:'articleBanner',
        iconUrl:'',
        bannerUrl:'',
        form:{
          title:'',
          icon:'',
          categId:'',
          author:'',
          browseCnt:'',
          likeCnt:'',
          banner:'',
          bannerUrl:'',
        },
        typeList:[
          {
            text:'推荐',
            value:1
          },
          {
            text:'热门',
            value:2
          },
          {
            text:'娱乐',
            value:3
          },
          {
            text:'生活',
            value:4
          },
          {
            text:'财经',
            value:5
          },
          {
            text:'医疗',
            value:6
          },
          {
            text:'科技',
            value:7
          },
          {
            text:'生物',
            value:8
          },
          {
            text:'资讯',
            value:9
          },
        ],
        editor:null,
        editId:null,
        rules:{
          title:[{ required: true, message: '请输入文章名称', trigger: 'blur' }],
          icon:[{ required: true, message: '请输入上传文章缩略图', trigger: 'change' }],
          categId:[{ required: true, message: '请选择文章分类', trigger: 'change' }],
          author:[{ required: true, message: '请输入文章来源', trigger: 'blur' }],
          browseCnt:[{ required: true, message: '请输入文章浏览量', trigger: 'blur' }],
        }
      }
    },
    beforeMount(){
      this.editId=this.$route.query.id;
    },
    mounted(){
      this.getData();
      this.editor=UE.delEditor('editor');
      this.editor = UE.getEditor('editor',{
        BaseUrl: '',
        UEDITOR_HOME_URL: 'static/UE/',
        initialFrameHeight:500,
      });
      this.editor.ready(()=> {
        this.editor.setHeight(400);
      })
    },
    methods:{
      //补全表格图片路径
      formatImg(url){
        return url?tool.imgBaseUrl+'/'+url:'';
      },
      //获取编辑数据
      getData(){
        this.$get('/backend/cms',{
          id:this.editId
        }).then(r=>{
          if(r.state==0){
            for(var i in this.form){
              this.form[i]=r.data[i];
            }
            this.editor.ready(()=> {
              this.editor.setContent(r.data.content);
            });
            this.iconUrl=r.data.icon==''?'':this.formatImg(r.data.icon);
            this.bannerUrl=r.data.banner==''?'':this.formatImg(r.data.banner);
          }
        })
      },
      //上传缩略图
      fileCover(data){
        console.log(data);
        this.form.icon=data.response.result;
        this.iconUrl=tool.imgBaseUrl+'/'+data.response.result;
      },
      //删除缩略图
      removeCover(){
        this.form.icon='';
        this.iconUrl='';
      },
      //上传广告图
      fileBanner(data){
        this.form.banner=data.response.result;
        this.bannerUrl=tool.imgBaseUrl+'/'+data.response.result;
      },
      //删除广告图
      removeBanner(){
        this.form.banner='';
        this.bannerUrl='';
      },
      //提交编辑信息
      submit(formName){
        var params=tool.extend({},this.form);
        params['content']=this.editor.getContent();
        if(params.content==''){
          this.$message({
            message:'请编辑文章内容',
            type:'warn'
          })
          return
        };
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if(this.editId){
              params['id']=this.editId;
              this.$put('/backend/cms',params).then(r=>{
                if(r.code==200){
                  this.$message.success('编辑文章成功');
                  this.$router.go(-1);
                }
              }).catch(err=>{
                this.$message.error(err.message);
              })
            }else{
              this.$post('/backend/cms',params).then(r=>{
                if(r.code==200){
                  this.$message.success('新增文章成功');
                  this.$router.go(-1);
                }
              }).catch(err=>{
                this.$message.error(err.message);
              })
            }
          }
        });
      },
    }
  }
</script>

<style scoped lang="scss">
  .title{
    margin-bottom:20px;
  }
  .face{
    width: 200px;
    height:200px;
    img{
      display: block;
      width: 100%;
      height:100%;
    }
  }
  .btn-file{
    position: relative;
    display: inline-block;
    .file{
      position: absolute;
      left:0;
      top:0;
      z-index:2;
      width: 100%;
      height:100%;
      opacity:0;
      cursor: pointer;
      font-size:0px;
    }
  }
</style>
