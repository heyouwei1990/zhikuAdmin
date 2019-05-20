<template>
  <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" class='page' :current-page="page" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
</template>

<script>
export default {
  name: 'breadcrumb',
  data () {
    return {
      
    }
  },
  props:["page","pageSize","total"],
  mounted(){
    
  },
  methods(){
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
