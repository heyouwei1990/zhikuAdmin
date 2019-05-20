<template>
  <div class="articleSlider-page">
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
        <el-table-column prop="title" width="120" label="名称"></el-table-column>
        <el-table-column width='150' label="图片预览">
          <template slot-scope="scope">
            <img v-if="scope.row.bannerurl" :src="formatImg(scope.row.bannerurl)" class="img">
          </template>
        </el-table-column>
        <el-table-column prop="link" width='120' label="链接地址"> </el-table-column>
        <el-table-column prop="isDel" :formatter='formatIsDel' width='120' label="显示状态"> </el-table-column>
        <el-table-column prop="sequence" width="120" label="显示顺序"></el-table-column>
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
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="96px">
        <el-form-item label="轮播图名称" prop="title">
          <el-input v-model="editForm.title"  placeholder="请输入轮播图名称"></el-input>
        </el-form-item>
        <el-form-item label="图片" prop="bannerurl">
          <!--<el-upload
            class="banner-file"
            :show-file-list="false"
            :action="uploadUrl"
            :on-success="handlePreview"
            :on-remove="handleRemove"
          >
            <i class="el-icon-plus"></i>
            <img class="banner" v-show="editForm.bannerurl" :src="editForm.bannerurl" alt="">
          </el-upload>-->
          <uploader
            :fileName="fileName"
            @success="filePic"
            @remove="removePic"
            :image="bannerUrl"
          ></uploader>
        </el-form-item>
        <el-form-item label="链接地址" prop="link">
          <el-input v-model="editForm.link" placeholder="请输入链接地址"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sequence">
          <el-input v-model.number="editForm.sequence" placeholder="请输入显示顺序"></el-input>
        </el-form-item>
        <el-form-item label="显示状态" prop="isDel">
          <el-select v-model="editForm.isDel" placeholder="请选择">
            <el-option label="是" value="0"> </el-option>
            <el-option label="否" value="1"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import tool from '@/vendor/tool'
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
        fileName:'articleSlider',
        type:3,
        bannerUrl:'',
        tableData: [],
        editForm:{
          title:"",
          bannerurl:"",
          sequence:"",
          isDel:"0",
          link:""
        },
        editId:null,
        editTitle:'新增图片',
        delItems:[],
        activeIndex: '3',
        editVisible:false,
        pageIndex:1,
        pageSize:10,
        total:0,
        loading:false,
        rules:{
          title:[{required:true,message:'请输入轮播图名称',trigger:'blur'}],
          bannerurl:[{required:true,message:'请上传轮播图',trigger:'change'}],
          link:[{required:true,message:'请输入轮播图链接地址',trigger:'blur'}],
          sequence:[
            {required:true,message:'请输入显示顺序',trigger:'blur'},
            {validator:validateNumber, trigger:'blur'}
          ],
          isDel:[{required:true,message:'请选择显示状态',trigger:'change'}],
        }
      }
    },
    mounted(){
      this.getData();
    },
    watch:{
      dialogVisible(v){
        if(!v){
          //弹框关闭，清空form表单
          this.resetForm();
        }
      }
    },
    methods:{
      //补全表格图片路径
      formatImg(url){
        return url?tool.imgBaseUrl+'/'+url:'';
      },
      //上传
      filePic(data){
        this.editForm.bannerurl=data.response.result;
        this.bannerUrl=tool.imgBaseUrl+'/'+data.response.result;
      },
      //删除
      removePic(){
        this.editForm.bannerurl='';
        this.bannerUrl='';
      },
      //格式化显示状态
      formatIsDel: function (row, column) {
        return row.isDel == false ? '是' : row.isDel == true ? '否': '未知';
      },
      //获取数据
      getData(){
        this.loading=true;
        this.$get('/backend/banner/getBanner/'+this.pageIndex,{
          pages:this.pageIndex,
          size:this.pageSize,
          type:this.type,
        }).then(r=>{
          this.loading=false;
          if(r.returnCode==200){
            this.tableData =r.data
            this.total = Number(r.sizes);
          }
        }).catch(function(err){

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
        this.$get('/backend/banner/deleteByIds',{
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
        }).catch((err)=>{
          this.$message.error(err.message)
        });
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
        this.editTitle='新增图片';
        this.editVisible = true;
      },
      //编辑
      edit(item){
        this.editId=item.row.id;
        this.editTitle='编辑图片';
        this.$get('/backend/banner?id='+this.editId,{
          id:this.editId
        }).then(r=>{
          if(r.code==200){
            this.editVisible = true;
            this.bannerUrl=this.formatImg(r.data.bannerurl);
            this.editForm.bannerurl =r.data.bannerurl;
            this.editForm.title = r.data.title;
            this.editForm.sequence = r.data.sequence;
            this.editForm.isDel = r.data.isDel+'';
            this.editForm.link = r.data.link;
          }
        }).catch((err)=>{
          this.$message.error(err.message)
        });
      },
      //关闭弹框
      handleClose() {
        this.$confirm('确认关闭？').then(_ => {
          this.editVisible=false;
          this.resetForm();
        }).catch(err=>{
          console.log(err)
        })
      },
      //清空表单
      resetForm(){
        this.$refs['editForm'].resetFields();
        this.editForm.bannerurl = '';
        this.editForm.title = '';
        this.editForm.sequence = '';
        this.editForm.isDel = '';
        this.editForm.link = '';
        this.bannerUrl='';
      },
      //提交编辑
      submit(){
        let params={...this.editForm};
        this.$refs['editForm'].validate(valid=>{
          if(valid){
            if(this.editId){
              params['id']=this.editId;
              params['type']=this.type;
              this.$put('/backend/banner',params).then(r=>{
                this.$message.success('编辑成功');
                this.editVisible=false;
                this.getData();
                this.resetForm();
              }).catch((err)=>{
                this.$message.error(err.message)
              });
            }else{
              this.$post('/backend/banner',params).then(r=>{
                this.$message.success('添加成功');
                this.editVisible=false;
                this.getData();
                this.resetForm();
              }).catch((err)=>{
                this.$message.error(err.message)
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
  .articleSlider-page{
    .table .img{
      display: block;
      max-width: 100%;
      max-height: 100px;
    }
  }
</style>
