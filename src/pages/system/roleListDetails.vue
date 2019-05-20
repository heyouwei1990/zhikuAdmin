<template>
  <div>
    <el-tree :data="data" show-checkbox node-key="id" ref="tree" highlight-current class='tree' :props="defaultProps"></el-tree>
    <div style="margin: 20px 100px;">
      <el-button>清空</el-button>
      <el-button type="primary"  @click="getCheckedNodes">确定</el-button>
    </div>
  </div>
</template>
<script>
  import axios from 'axios';
  import qs from 'qs'
export default {
  name: 'roleList',
  components:{
    
  },
  data () {
    return {
      data: [{
        id: 1,
        label: '一级 1',
        children: [{
          id: 4,
          label: '二级 1-1',
          children: [{
            id: 9,
            label: '三级 1-1-1'
          }, {
            id: 10,
            label: '三级 1-1-2'
          }]
        }]
      }, {
        id: 2,
        label: '一级 2',
        children: [{
          id: 5,
          label: '二级 2-1'
        }, {
          id: 6,
          label: '二级 2-2'
        }]
      }, {
        id: 3,
        label: '一级 3',
        children: [{
          id: 7,
          label: '二级 3-1'
        }, {
          id: 8,
          label: '二级 3-2'
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  mounted:function(){
    this.$nextTick(()=>{
      
    })
  },
  methods:{
    onSubmit(){

    },
    getCheckedNodes() {
      console.log(this.$refs.tree.getCheckedNodes());
    }
  }
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
  }
  .tree{
    margin-top: 20px;
  }
</style>
