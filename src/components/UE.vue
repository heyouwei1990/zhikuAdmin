<template>
  <div>
    <div id="ueditor" type="text/plain"></div>
    <div @click='save'>保存</div>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        ueditor: ''
      }
    },
    mounted () {
      this.ueditor = UE.getEditor('ueditor',{
        BaseUrl: '',
        UEDITOR_HOME_URL: 'static/UE/'
      })
    },
    methods: {
      save(){
        let ueditordata = UE.getEditor('ueditor').getContent();
        console.log(ueditordata)
        // Event.$emit('seted', ueditordata);
      },
      getUEContent() { // 获取内容方法
        return this.ueditor.getContent()
      }
    }
  }
</script>