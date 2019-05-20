<template>
  <div class="upgradeRecord-page">
    <div class="search">
      <el-form ref="form" :model="form" :inline="true">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="会员手机号" @keyup.enter.native="getData"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="getData">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        v-loading='loading'
        highlight-current-row
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60"> </el-table-column>
        <el-table-column prop="id" label="序号"> </el-table-column>
        <el-table-column prop="nickName" label="会员昵称"> </el-table-column>
        <el-table-column prop="phone" width='110' label="会员手机号"> </el-table-column>
        <el-table-column prop="level"  label="原级别"> </el-table-column>
        <el-table-column prop="upLevel"  label="升级级别"> </el-table-column>
        <el-table-column prop="orderId"  label="升级订单流水号"> </el-table-column>
        <el-table-column width='100' label="升级时间">
          <template slot-scope="scope">{{!scope.row.addTime?"":new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column width='60' prop="upMoney"  label="升级金额"> </el-table-column>
        <el-table-column width='60' prop="payType" :formatter="formatPayType"  label="支付方式"> </el-table-column>
        <el-table-column width='100' label="支付时间">
          <template slot-scope="scope">{{!scope.row.payTime?"":new Date(scope.row.payTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column prop="upStatus"  label="升级状态" :formatter="formatUpStatus"> </el-table-column>
        <el-table-column label="详情" width='120' show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button size='mini' type='primary' @click="look(scope)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini" type="danger" :disabled="delItems.length==0" @click="mulDelete" >批量删除</el-button>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class='page' :current-page="pageIndex"
        :page-sizes="[1,10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    <el-dialog title="支付详情" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form :model="info" label-width="96px" :disabled="true" size="mini">
        <el-form-item label="升级订单号">
          <el-input v-model="info.orderId"></el-input>
        </el-form-item>
        <el-form-item label="支付流水号">
          <el-input v-model="info.payNum"></el-input>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-input v-model="info.payType"></el-input>
        </el-form-item>
        <el-form-item label="支付时间">
          <el-input v-model="info.payTime"></el-input>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-input v-model="info.payStatus"></el-input>
        </el-form-item>
        <el-form-item label="支付详情">
          <el-input v-model="info.remark" rows="5" type="textarea"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
  import axios from 'axios';
  import qs from 'qs'
  import { imgUrl,isLogin } from '../../../config/common';
export default {
  name: 'upgradeRecord',
  components:{

  },
  data () {
    return {
      tableData: [],
      form: {
        phone: '',
      },
      delItems:[],
      info:{},
      pageIndex:1,
      total:1,
      pageSize:10,
      loading:false,
      dialogVisible:false,
    }
  },
  mounted(){
    this.getData()
  },
  methods:{
    //格式化支付方式
    formatPayType(row,column){
      let str='';
      if(row.payType == 1){
        str='微信';
      }
      if(row.payType == 2){
        str='支付宝';
      }
      return str;
    },
    //格式化升级状态
    formatUpStatus(row,column){
      let str='';
      if(row.upStatus == 0){
        str='升级失败';
      }
      if(row.upStatus == 1){
        str='升级成功';
      }
      return str;
    },
    getData(){
      this.loading=true;
      this.$get('/backend/user/upGradeList',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        phone:this.form.phone
      }).then(r=>{
        this.loading=false;
        if(r.status==0){
          var list=r.data;
          var level = {0:"普通会员",1:"VIP",2:"弟子合伙人",3:"创业",4:"院长"}
          for(var i =0;i<list.length;i++){
            list[i]['level'] = level[list[i]['level']];
            list[i]['upLevel'] = level[list[i]['upLevel']];
          }
          this.total=r.total;
          this.tableData=list;
        }
      }).catch(err=>{
        this.loading=false;
        this.$message.error(err.message);
      })
    },
    //查看
    look(data){
      let rowId=data.row.id;
      this.$get('/backend/user/getUpGradeById?id='+rowId).then(r=>{
        if(r.status==0){
          this.info.orderId=r.data.orderId;
          this.info.payNum=r.data.payNum;
          this.info.payType=r.data.payType==1?'微信':'支付宝';
          this.info.payTime=!r.data.payTime?'':new Date(r.data.payTime*1000).format('yyyy-MM-dd hh:mm');
          this.info.remark=r.data.remark;
          switch (r.data.payType){
            case 1:
              this.info.payType='微信';
              break;
            case 2:
              this.info.payType='支付宝';
              break;
            default :
              this.info.payType='';
          }
          switch (r.data.payStatus){
            case 0:
              this.info.payStatus='升级失败';
              break;
            case 1:
              this.info.payStatus='升级成功';
              break;
            default :
              this.info.payStatus='';
          }
          this.dialogVisible=true;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    handleClose(){
      this.$confirm('确认关闭？').then(_ => {
        this.dialogVisible=false;
        this.info.orderId='';
        this.info.payNum='';
        this.info.payType='';
        this.info.payTime='';
        this.info.payStatus='';
      }).catch(err=>{
        console.log(err)
      })
    },
    //选中的条目
    handleSelectionChange(data){
      this.delItems=data;
    },
    //批量删除
    mulDelete(){
      let ids=[];
      for(let i=0;i<this.delItems.length;i++){
        ids.push(this.delItems[i].id);
      }
      var idsStr=ids.join(',');
      this.$get('/backend/user/deleteUpGradeByIds',{
        ids:idsStr
      }).then(r=>{
        if(r.status==0){
          this.$message({
            showClose:true,
            message:'删除成功',
            type:'success'
          });
          this.getData();
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },
    //更改每页条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData()
    },
    //切换当前页
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData()
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .upgradeRecord-page{
    .el-input.is-disabled .el-input__inner,{
      background-color: #fff;
      border: 0;
      color: #333;
      cursor: default;
    }
    .el-textarea.is-disabled .el-textarea__inner{
      background-color: #fff;
      color: #333;
      cursor: default;
      resize: none;
    }
  }
</style>
