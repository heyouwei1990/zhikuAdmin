<template>
    <div class="relation-page">
      <div class="search">
        <el-form ref="form" :model="form" :inline="true">
          <el-form-item label="手机号">
            <el-input v-model="form.phone" placeholder="请输入手机号"  @keyup.enter.native="getData"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="getData">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!--<el-table
        ref="multipleTable"
        :data="tableData"
        v-loading="loading"
        highlight-current-row
        tooltip-effect="dark"
        style="width: 100%">
        &lt;!&ndash;<el-table-column type="selection" width="40"> </el-table-column>&ndash;&gt;
        <el-table-column prop="id" label="序号" width='55'> </el-table-column>
        <el-table-column prop="inviteCode" label="邀请码" min-width='120'> </el-table-column>
        <el-table-column prop="nickName" label="会员昵称" min-width='120'> </el-table-column>
        <el-table-column prop="phone" label="会员手机号" min-width='120'> </el-table-column>
        <el-table-column prop="level" label="会员级别" :formatter="formatLevel" min-width='120'> </el-table-column>
        <el-table-column label="最近登录时间" min-width='120'>
          <template slot-scope="scope">
            {{scope.row.lastLoginTime==0?"无登录时间":new Date(scope.row.lastLoginTime*1000).format("yyyy-MM-dd")}}
          </template>
        </el-table-column>
        <el-table-column prop="haveNode" label="父节点" min-width='120'> </el-table-column>
      </el-table>-->
      <zk-table
        ref="table"
        sum-text="sum"
        index-text="#"
        :data="tableData"
        :columns="columns"
        :stripe="props.stripe"
        :border="props.border"
        :show-header="props.showHeader"
        :show-summary="props.showSummary"
        :show-row-hover="props.showRowHover"
        :show-index="props.showIndex"
        :tree-type="props.treeType"
        :is-fold="props.isFold"
        :expand-type="props.expandType"
        :selection-type="props.selectionType">
        <template slot="active" slot-scope="scope">
          {{scope.row.lastLoginTime==0?"无登录时间":new Date(scope.row.lastLoginTime*1000).format("yyyy-MM-dd")}}
        </template>
        <template slot="haveNode" slot-scope="scope" v-if='scope.row.haveNode'>
          <el-button type='primary' size='mini' @click='getSubordinate(scope)'>父节点</el-button>
        </template>
      </zk-table>
      <div id="page">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class='page'
          :current-page="pageIndex"
          :page-sizes="[1,10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
</template>
<script>
  import tool from '@/vendor/tool'
export default {
    name: 'example',
    //表格各行的数据
    data() {
      return {
        props: {
          stripe: false,//是否显示间隔斑马纹
          border: false,//是否显示纵向边框
          showHeader: true,//是否显示表头
          showSummary: false,//是否显示表尾合计行
          showRowHover: true,//鼠标悬停时，是否高亮当前行
          showIndex: false,//是否显示数据索引
          treeType: true,//是否为树形表格
          isFold: false,//树形表格中父级是否默认折叠
          expandType: false,//是否为展开行类型表格（为 True 时，需要添加作用域插槽, 它可以获取到 row, rowIndex)
          selectionType: false,//是否显示间隔斑马纹
        },//表格标题数据
        columns: [
          {
              label: "序号",
              prop: "id"
          },
          {
              label: "邀请码",
              prop: "inviteCode"
          },
          {
              label: "会员昵称",
              prop: "nickName",
              minWidth: "50px"
          },
          {
              label: "会员手机号",
              prop: "phone"
          },
          {
              label: "会员级别",
              prop: "level"
          },
          {
              label: "最近登录时间",
              prop: "active",
              type: "template",
              template: "active"
          },
          {
              label: "父节点",
              prop: "haveNode",
              type: "template",
              template: "haveNode"
          }
        ],
        tableData: [],
        form: {
          phone: '',
        },
        pageIndex:1,
        pageSize:10,
        loading:false,
        total:0,
        datas:[]
      };
    },
    mounted(){
      this.getData();
    },
    methods:{
      //等级名称
      formatLevel(level) {
        var str='';
        switch (level){
          case 0:
            str='普通会员';
            break;
          case 1:
            str='VIP';
            break;
          case 2:
            str='弟子合伙人';
            break;
          case 3:
            str='创业';
            break;
          case 4:
            str='院长';
            break;
        }
        return str;
      },
      getData(){
        this.loading=true;
        this.$get('/backend/user/relationList',{
          startPage:this.pageIndex,
          pageSize:this.pageSize,
          ...this.form
        }).then(r=>{
          this.loading=false;
          if(r.status==0){
            var list=r.data;
            for (var i=0;i<list.length;i++){
              list[i].level=this.formatLevel(list[i].level);
            }
            this.tableData=list;
            this.total=r.total;
          }
        }).catch(err=>{
          this.loading=false;
          this.$message.error(err.message);
        })
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.getData();
      },
      handleCurrentChange(val) {
        this.pageIndex = val;
        this.getData();
      },
      getSubordinate(item){
        var userAuthId=item.row.userAuthId;
        this.$get('/backend/user/relationList',{
          referreruserid:userAuthId,
          startPage:1,
          pageSize:1000,
        }).then(r=>{
          if(r.status==0){
            var list=r.data;
            var tableData=[...this.tableData];
            for (var i=0;i<list.length;i++){
              list[i]['children'] = [];
              list[i].level=this.formatLevel(list[i].level);
            }
            for(var j=0;j<tableData.length;j++){
              //将获取的列表设置到当前点击行的children属性上
              if(tableData[j]['userAuthId'] == userAuthId ){
                tableData[j]['children'] = list
              }
            }
            this.tableData = tableData;
          }
        }).catch(err=>{
          this.$message.error(err.message);
        })
      }
    }
  };
</script>
<style lang="scss">
  .relation-page{
    .zk-table__header-cell{
      font-size:14px;
      color: #909399;
      font-weight: bold;
      line-height:23px;
    }
    .zk-table__body-cell{
      font-size:14px;
      color: #606266;
      line-height:23px;
    }
  }

</style>
