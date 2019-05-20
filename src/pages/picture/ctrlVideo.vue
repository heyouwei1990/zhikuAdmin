<template>
  <div class="ctrlVideo-page">
    <div class="search">
      <el-form ref="form">
        <el-button type="primary" size="small" class="create" @click="create">新建</el-button>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        v-loading='loading'
        tooltip-effect="dark"
        highlight-current-row
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60"> </el-table-column>
        <el-table-column prop="id" width='100' label="编号"> </el-table-column>
        <el-table-column prop="title" width="160" label="操作手册名称"></el-table-column>
        <el-table-column width='150' label="ICON图片">
          <template slot-scope="scope">
            <img v-if="scope.row.icon" :src="formatImg(scope.row.icon)" class="img">
          </template>
        </el-table-column>
        <el-table-column prop="sortInd" width="120" label="显示顺序"></el-table-column>
        <el-table-column prop="link" width='120' label="链接地址"> </el-table-column>
        <el-table-column width="120" label="更新时间">
          <template slot-scope="scope">{{!scope.row.updateTime?"暂无更新时间":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column label="操作" min-width='120' show-overflow-tooltip >
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)'>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini" :disabled="delItems.length==0" type='danger' @click="mulDelete">批量删除</el-button>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class='page'
        :current-page="pageIndex"
        :page-sizes="[1,10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"></el-pagination>
    </div>
    <!-- 添加图片 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="30%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="90px">
        <el-form-item label="视频名称" prop="title">
          <el-input v-model="editForm.title"  placeholder="请输入视频名称"></el-input>
        </el-form-item>
        <el-form-item label="ICON图片" prop="icon">
          <uploader
            :fileName="fileName"
            @success="filePic"
            @remove="removePic"
            :image="videoIcon"
          ></uploader>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sortInd">
          <el-input v-model.number="editForm.sortInd" placeholder="请输入显示顺序"></el-input>
        </el-form-item>
        <el-form-item label="链接地址" prop="link">
          <el-input v-model="editForm.link" placeholder="请输入链接地址"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">确 定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
  import tool from '@/vendor/tool';
  import uploader from '@/components/uploader'
  export default {
    components:{
      uploader
    },
    data () {
      var validateNumber=(rule,value,callback)=>{
        if(!/^[1-9]\d*$/g.test(value)){
          callback(new Error('请输入正整数'))
        }else{
          callback();
        }
      };
      return {
        fileName:'videoCover',
        videoIcon:'',
        tableData: [],
        editForm:{
          title:"",
          icon:"",
          sortInd:"",
          link:""
        },
        editId:null,
        editTitle:'',
        delItems:[],
        editVisible:false,
        pageIndex:1,
        pageSize:10,
        total:0,
        loading:false,
        rules:{
          title:[{required:true,message:'请输入视频名称',trigger:'blur'}],
          icon:[{required:true,message:'请上视频封面',trigger:'change'}],
          link:[{required:true,message:'请输入视频链接地址',trigger:'blur'}],
          sortInd:[
            {required:true,message:'请输入显示顺序',trigger:'blur'},
            {validator:validateNumber, trigger:'blur'}
          ],
        }
      }
    },
    mounted(){
      this.getData();
    },
    methods:{
      //补全表格图片路径
      formatImg(url){
        return url?tool.imgBaseUrl+'/'+url:'';
      },
      //上传
      filePic(data){
        this.editForm.icon=data.response.result;
        this.videoIcon=tool.imgBaseUrl+'/'+data.response.result;
      },
      //删除
      removePic(){
        this.editForm.icon='';
        this.videoIcon='';
      },
      //格式化显示状态
      formatIsDel: function (row, column) {
        return row.isDel == false ? '是' : row.isDel == true ? '否': '未知';
      },
      //获取数据
      getData(){
        this.loading=true;
        this.$get('/backend/cmsv/getVideo/'+this.pageIndex+'?size='+this.pageSize).then(r=>{
          this.loading=false;
          if(r.returnCode==200){
            this.tableData = r.data;
            this.total = Number(r.sizes);
          }
        }).catch((err)=>{
          this.$message.error(err.message)
        });
      },
      //获取选中的表格信息
      handleSelectionChange(data){
        this.delItems=data;
      },
      //选择删除
      mulDelete(){
        let ids=[];
        for(let i=0;i<this.delItems.length;i++){
          ids.push(this.delItems[i].id);
        }
        var idsStr=ids.join(',');
        this.$get('/backend/cmsv/deleteByIds',{
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
        })
      },
      //每页显示条数
      handleSizeChange(val) {
        this.pageSize = val;
        this.getData();
      },
      //切换当前页
      handleCurrentChange(val) {
        this.pageIndex = val;
        this.getData();
      },
      //新增轮播图
      create(){
        this.editId=null;
        this.editTitle='新增视频';
        this.editVisible = true;
      },
      //编辑
      edit(item){
        this.editId=item.row.id;
        this.editTitle='编辑视频';
        this.$get('/backend/cmsv?id='+this.editId,{
          id:this.editId
        }).then(r=>{
          if(r.state==0){
            this.editVisible = true;
            this.videoIcon=this.formatImg(r.data.icon);
            this.editForm.icon = r.data.icon;
            this.editForm.title = r.data.title;
            this.editForm.sortInd = r.data.sortInd;
            this.editForm.link = r.data.link;
          }
        })
      },
      //关闭弹框
      handleClose() {
        this.$confirm('确认关闭？').then(_ => {
          this.resetForm();
          this.editVisible=false;
        }).catch(err=>{
          console.log(err)
        })
      },
      //清空表单
      resetForm(){
        this.$refs['editForm'].resetFields();
        this.editForm.icon = '';
        this.editForm.title = '';
        this.editForm.sortInd = '';
        this.editForm.link = '';
        this.videoIcon='';
      },
      //提交编辑
      submit(){
        this.$refs['editForm'].validate(valid=>{
          if(valid){
            let params={...this.editForm};
            if(this.editId){
              params['id']=this.editId;
              this.$put('/backend/cmsv',params).then(r=>{
                this.$message({
                  message:r.message,
                  type:'success'
                });
                this.editVisible=false;
                this.resetForm();
                this.getData();
              }).catch((err)=>{
                this.$message.error(err.message);
              });
            }else{
              this.$post('/backend/cmsv',params).then(r=>{
                this.$message({
                  message:r.message,
                  type:'success'
                });
                this.editVisible=false;
                this.resetForm();
                this.getData();
              }).catch((err)=>{
                this.$message.error(err.message);
              });
            }
          }
        })
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .ctrlVideo-page{
    .table .img{
      display: block;
      max-width: 100%;
      max-height: 100px;
    }
  }
</style>
