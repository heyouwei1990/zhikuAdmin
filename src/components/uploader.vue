<template>
  <div class="uploader-module">
    <el-upload
      class="file-module"
      :show-file-list="false"
      :action="uploadUrl"
      :on-error="fail"
      :on-progress="uploading"
      :on-success="handlePreview"
      :on-remove="remove"
      :before-upload="beforeAvatarUpload"
      v-loading="loading"
    >
      <div class="file-area"><i class="el-icon-plus"></i></div>

      <img class="picture" v-if="image" :src="image" alt="">
      <i class="el-icon-close" slot="tip" @click="remove" v-if="image"></i>
    </el-upload>
  </div>
</template>

<script>
  import tool from '@/vendor/tool'
  export default {
    data(){
      return{
        loading:false,
        filePath:'/backend/uploading/insertImage',
      }
    },
    computed:{
      uploadUrl(){
        var token=tool.getSession('token');
        if(tool.debug){
          return tool.baseUrl+this.filePath+'/'+this.fileName+'?token='+token;
        }else{
          return window.location.origin+this.filePath+'/'+this.fileName+'?token='+token;
        }

      }
    },
    props:{
      image:{
        type:String,
        default:''
      },
      fileName:{
        type:String,
        default:''
      }
    },
    methods:{
      //上传成功
      handlePreview(res,file){
        this.loading=false;
        if(res.code==200){
          this.$emit('success',file);
          this.$message.success('上传成功');
        }
      },
      //上传失败
      fail(err,file){
        this.loading=false;
        this.$message.error('上传失败');
      },
      //上传时
      uploading(){
        this.loading=true;
      },
      //删除图片
      remove(){
        this.$emit('remove');
      },
      beforeAvatarUpload(file) {
        const isLt1M = file.size / 1024 / 1024 < 1;
        if (!isLt1M) {
          this.$message.error('上传图片大小不能超过2MB!');
        }
        return isLt1M;
      },
    }
  }
</script>

<style lang="scss">
  .uploader-module{
    .file-module{
      width: 120px;
      height:120px;
      position: relative;
      .picture{
        width: 100%;
        height:100%;
        display: block;
        position: absolute;
        left:0;
        top:0;
      }
      .el-icon-plus{
        position: absolute;
        left:50%;
        top:50%;
        z-index:0;
        font-size:20px;
        color: #999;
        transform: translate(-50%,-50%);
      }
      .el-icon-close{
        position: absolute;
        right:-8px;
        top:-8px;
        background-color: #f00;
        border-radius: 50%;
        padding:2px;
        color: #fff;
        cursor: pointer;
      }
    }
    .el-upload{
      width: 100%;
      height:100%;
    }
    .file-area{
      width: 100%;
      height:100%;
      position: relative;
      &:before{
        content: '';
        position: absolute;
        left:0;
        top:0;
        width: 100%;
        height:100%;
        z-index:0;
        border:1px dashed #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }
    }
  }
</style>
