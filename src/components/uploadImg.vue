<template>
    <div>
      <el-upload
        class="avatar-uploader"
        :action="url"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :on-error='uploadError'
        :data='token'
        name='upload'
        :before-upload="beforeAvatarUpload">
        <img v-if="imageUrl" :src="imageUrl" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
    </div>
</template>
<script>
  import { imgUrl } from '../../config/common';
export default {
  data () {
    return {
      imageUrl:"",
      token:{
        token:'',
        type:''
      },
      url:""
    }
  },
  props:["img","type"],
  mounted:function(){
    this.$nextTick(function(){
      this.imageUrl = this.img;
      this.token.type = this.type
      this.token.token = window.sessionStorage.getItem("token");
      this.url=process.env.API_ROOT+"/zhimage/index";
    })
  },
  methods:{
    handleAvatarSuccess(res, file,fileList) {
      // this.imageUrl = URL.createObjectURL(file.raw);
      if(this.type != 'meetingImages'){
        this.imageUrl = imgUrl()+"/"+this.type+"/"+res.data.url;
      }
      res.data.type = this.type;
      this.$emit('ievent', res);
      this.$message({
        showClose: true,
        message: '上传成功',
        type: 'success'
      });
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'||file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error('上传图片只能是JPG或者png格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过2MB!');
      }
      return isJPG && isLt2M;
    },
    uploadError(e){
      this.$message({
        showClose: true,
        message: '上传失败,请重新上传',
        type: 'error'
      });
    }
  },
  watch:{
    img:{//img得在data中声明
      handler(oldVal,newVal){
        this.imageUrl = oldVal
      },
      deep:true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
    background: red;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
  }
  .el-icon-plus{
    border: 1px dashed #ccc;border-radius: 5px
  }
</style>
