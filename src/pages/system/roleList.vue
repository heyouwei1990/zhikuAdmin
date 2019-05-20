<template>
  <div class="roleList-page">
    <div class="search">
      <el-form ref="form" :model="form">
        <el-button type="primary" size="small" @click="create" v-show='addIsShow'>添加角色</el-button>
      </el-form>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="tableData"
        v-loading="loading"
        highlight-current-row
        tooltip-effect="dark"
        @selection-change="handleSelectionChange"
        style="width: 100%">
        <el-table-column  type="selection"  width="40"> </el-table-column>
        <el-table-column prop="name" width="150" label="角色名称"> </el-table-column>
        <el-table-column prop="desc" min-width="150" label="角色描述"> </el-table-column>
        <el-table-column min-width="150" label="创建时间">
          <template slot-scope="scope">{{new Date(scope.row.addTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
        <el-table-column min-width='150' label="修改时间">
          <template slot-scope="scope">{{scope.row.updateTime==0?"无":new Date(scope.row.updateTime*1000).format("yyyy-MM-dd")}}</template>
        </el-table-column>
       <!--  <el-table-column prop="name" width="150" label="角色权限">
          <template slot-scope="item">
            <el-button size="mini" type="warning" @click='view(item)'>查看</el-button>
          </template>
        </el-table-column> -->
        <el-table-column label="操作" width='150' show-overflow-tooltip>
          <template slot-scope="item">
            <el-button size="mini" type="primary" @click='edit(item)' v-show='editIsShow'>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div id="page">
      <div class="batch">
        <el-button size="mini" type='danger' :disabled="delItems.length==0" @click="mulDelete">批量删除</el-button>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class='page'
        :current-page="pageIndex"
        :page-sizes="[1,10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"> </el-pagination>
    </div>
    <!--<el-dialog title="添加角色" :visible.sync="dialogVisible" width="60%" :before-close="handleClose">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="角色名称">
          <el-input v-model="form.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input type="textarea" v-model="form.desc" placeholder='请输入角色描述'></el-input>
        </el-form-item>
        <el-form-item :label="key" :key='key' v-for='(item,key,index) in checkboxData'>
          <span style="margin-right: 10px;" v-for='items in item' v-if='items.name'>
            <input type="checkbox" :id="items.name" :key='items.id' :value="items.id" @change='getCheckBox(items)'>
            <label :for="items.name">{{items.name}}</label>
          </span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>-->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="60%" :before-close="handleClose">
      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="120px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="desc">
          <el-input type="textarea" v-model="editForm.desc" placeholder='请输入角色描述'></el-input>
        </el-form-item>
        <el-form-item :label="key"  :key='key' v-for='(item,key,index) in checkboxData'>
          <el-checkbox-group v-model="editForm.rules">
            <el-checkbox
              v-for="items in item"
              v-if="items.name"
              :label="items.id"
              :key="items.id"
              class="check-item"
            >{{items.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="查看权限" :visible.sync="viewVisible" width="60%" :before-close="closeView">
      <el-form ref="form" label-width="120px">
        <el-form-item :label="key" :key='key' v-for='(item,key,index) in checkboxData'>
          <!--<span style="margin-right: 10px;" v-for='items in item' v-if='items.name'>
            <input type="checkbox" :id="items.name"  :checked='items.is_check' :value="items.id">
            <label :for="items.name">{{items.name}}</label>
          </span>-->
          <el-checkbox-group  >
            <el-checkbox v-for="items in item" v-if="items.name" :label="item.id" :key="item.id">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeView">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import axios from 'axios';
  import qs from 'qs'
  import tool from '@/vendor/tool'
export default {
  name: 'roleList',
  components:{

  },
  data () {
    return {
      tableData: [],
      checkboxData:[],
      form: {
        name: '',
        desc: ''
      },
      editVisible:false,
      viewVisible:false,
      pageIndex:1,
      pageSize:10,
      loading: false,
      total:0,
      delItems:[],
      editId:null,
      editTitle:'',
      editForm:{
        name:"",
        desc:"",
        rules:'',
      },
      rules:{
        name:[{required:true,message:'请输入角色名称',trigger:'blur'}],
        desc:[{required:true,message:'请输入角色描述',trigger:'blur'}],
      },
      roleId:[],
      checkedRole:[],
      roleListData:[],
      idStrArr:[]
    }
  },
  computed:{
    editIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
    addIsShow(){
      return tool.getSession('rules')=='*'?true:false;
    },
  },
  mounted:function(){
    this.getData();
    this.menuList();
  },
  methods:{
    //获取数据
    getData(){
      this.loading=true;
      this.$get('/backend/adminRole/list',{
        startPage:this.pageIndex,
        pageSize:this.pageSize,
        ...this.form
      }).then(r=>{
        this.loading=false;
        if(r.status==0){
          this.tableData=r.data;
          this.total=r.total;
        }
      }).catch(err=>{
        this.loading=false;
        this.$message.error(err.message);
      })
    },
    //多选
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
      this.$get('/backend/adminRole/deleteByIds',{
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
    //每页条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData();
    },
    //切换当前页
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getData();
    },
    //创建
    create(){
      this.editTitle='添加角色';
      this.editId=null;
      this.editVisible=true;
      this.editForm.rules=[];
    },
    //编辑
    edit(item){
      this.editTitle='编辑角色';
      this.editId=item.row.id;
      this.editForm.name = item.row.name;
      this.editForm.desc = item.row.desc;
      this.editForm.rules=item.row.rules.split(',').map((item)=>{
        return parseInt(item);
      });
      this.editVisible=true;

    },
    //清空表单
    resetForm(){
      this.$refs['editForm'].resetFields();
      this.editId=null;
      this.editForm.name = '';
      this.editForm.desc = '';
      this.editForm.rules = '';
    },
    //关闭弹框
    handleClose() {
      this.$confirm('确认关闭？').then(_ => {
        this.editVisible=false;
        this.resetForm();
      }).catch(_ => {});
    },
    //提交编辑表单
    submit(){
      this.$refs['editForm'].validate(valid=>{
        if(valid){
          var params={};
          params={...this.editForm};
          params["rules"]=this.editForm.rules.join(',');
          if(this.editId){
            params['id']=this.editId;
          }
          this.$post('/backend/adminRole/insertOrUpdate',params).then(r=>{
            if(r.status==0){
              if(this.editId){
                this.$message.success('编辑成功');
              }else{
                this.$message.success('添加成功');
              }
              this.editVisible=false;
              this.resetForm();
              this.getData();
            }else{
              this.$message.error(r.message);
            }
          }).catch(err=>{
            this.$message.error(err.message);
          })
        }
      })
    },
    menuList(){
      this.$get('/backend/adminMenu/list',{
        pageSize:20000,
      }).then(r=>{
        if(r.status==0){
          var list=r.data;
          var admin = [],
            adminMenu = [],
            adminRole = [],
            adminSetting = [],
            adminstrator = [],
            agent = [],
            banner = [],
            comment = [],
            commodity = [],
            lecturer = [],
            meeting = [],
            message = [],
            moneystream = [],
            operationmanual = [],
            order = [],
            site = [],
            sponsor = [],
            system = [],
            ueditor = [],
            umeditor = [],
            uploading = [],
            user = [],
            userCard = [],
            userCode = [],
            usersponsorvip = [],
            withdrawDeposit = [];
          for(var i=0;i<list.length;i++){
            var pathName=list[i].actionId.split('/')[0];
            list[i]['isCheck']=false;
            switch (pathName){
              case 'admin':
                admin.push(list[i]);
                break;
              case 'adminMenu':
                adminMenu.push(list[i]);
                break;
              case 'adminRole':
                adminRole.push(list[i]);
                break;
              case 'adminSetting':
                adminSetting.push(list[i]);
                break;
              /*case 'adminstrator':
                adminstrator.push(list[i]);
                break;*/
              case 'agent':
                agent.push(list[i]);
                break;
              case 'banner':
                banner.push(list[i]);
                break;
              /*case 'comment':
                comment.push(list[i]);
                break;*/
              /*case 'commodity':
                commodity.push(list[i]);
                break;*/
              case 'lecturer':
                lecturer.push(list[i]);
                break;
              case 'meeting':
                meeting.push(list[i]);
                break;
              case 'message':
                message.push(list[i]);
                break;
              case 'moneystream':
                moneystream.push(list[i]);
                break;
              case 'operationmanual':
                operationmanual.push(list[i]);
                break;
              case 'order':
                order.push(list[i]);
                break;
              case 'site':
                site.push(list[i]);
                break;
              case 'sponsor':
                sponsor.push(list[i]);
                break;
              case 'system':
                system.push(list[i]);
                break;
              case 'ueditor':
                ueditor.push(list[i]);
                break;
              case 'umeditor':
                umeditor.push(list[i]);
                break;
              case 'uploading':
                uploading.push(list[i]);
                break;
              case 'user':
                user.push(list[i]);
                break;
              case 'userCard':
                userCard.push(list[i]);
                break;
              case 'userCode':
                userCode.push(list[i]);
                break;
              /*case 'usersponsorvip':
                usersponsorvip.push(list[i]);
                break;*/
              case 'withdrawDeposit':
                withdrawDeposit.push(list[i]);
                break;
              default:
            }
          }
          var tempObj = {
            "菜单列表":adminMenu,
            "基础设置":adminSetting,
            "登录管理":admin,
            "代理商列表":agent,
            //"会议会员权限":usersponsorvip,
            "banner管理":banner,
            //"评论管理":comment,
            "讲师模块":lecturer,
            "会议模块":meeting,
            "消息模块":message,
            "订单模块":order,
            //"商品模块":commodity,
            "资源名片模块":userCard,
            "角色模块":adminRole,
            "主办方模块":sponsor,
            "系统管理模块":moneystream,
            "邀请码模块":userCode,
            "用户管理模块":user,
            "收益模块":withdrawDeposit,
            "上传图片模块":uploading,
          }
          this.checkboxData=tempObj;
        }
      }).catch(err=>{
        this.$message.error(err.message);
      })
    },

    init(){
      var params = {},that = this;
        params['token'] = window.sessionStorage.getItem("token");
        params['page'] = this.page;
        params['pageSize'] = this.pageSize;
      axios.post(process.env.API_ROOT+'/role/index', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.tableData = res.data.data.list;
          that.page = res.data.data.pager.page;
          that.total = Number(res.data.data.pager.Counts);
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
        that.loading=false;
      })
      .catch(function(err){
        that.loading=false;
      });
    },
    addRole(){
      var that = this;
      var data = that.form;
          data['token'] = window.sessionStorage.getItem("token");
      var checkedRole = this.checkedRole,
          idStrArr = [];
      for(var i=0;i<checkedRole.length;i++){
        if(checkedRole[i]['is_check'] == true){
          idStrArr.push(checkedRole[i]['id'])
        }
      }
      data['rules'] = idStrArr.join(",")
      axios.post(process.env.API_ROOT+'/role/add', qs.stringify(data),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.dialogVisible = false;
          that.$message({
            showClose: true,
            message: '添加成功',
            type: 'success'
          });
          that.init();
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'warning'
          });
        }
      })
      .catch(function(err){

      });
    },
    view(item){
      var rulesData = item.row.rules;//权限id
      this.idStrArr = rulesData.split(",")
      var data = this.roleListData;//角色列表
      for(var i =0;i<data.length;i++){
        if(rulesData.indexOf(data[i]['id'])!=-1){
          data[i]['is_check'] = true
        }
      }
      this.dialogVisible3 = true;
    },
    edit1(item){
      this.dialogVisible2 = true;
      var params = {};
      params['name'] = item.row.name;
      params['desc'] = item.row.desc;
      params['id'] = item.row.id;
      var rulesData = item.row.rules;//权限id
      this.idStrArr = rulesData.split(",")
      this.editForm = params;
      var min=this.idStrArr[0];
      for(var i=0;i<this.idStrArr.length;i++){
        min=Math.min(min,this.idStrArr[i]);
      }
      var data = this.roleListData;//角色列表
      for(var i = 0;i<data.length;i++){
        if(rulesData.indexOf(data[i]['id'])!=-1){
          data[i]['is_check'] = true;
        }
      }
    },
    editRole(){
      var that = this,params = this.editForm;
      params['token'] = window.sessionStorage.getItem("token");
      var roleListData = this.roleListData,
          idStrArr = [];
      for(var i=0;i<roleListData.length;i++){
        if(roleListData[i]['is_check'] == true){
          idStrArr.push(roleListData[i]['id'])
        }
      }
      params['rules'] = idStrArr.join(",");
      axios.post(process.env.API_ROOT+'/role/update', qs.stringify(this.editForm),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        if(status==0){
          that.$message({
            showClose: true,
            message: '修改成功',
            type: 'success'
          });
          that.dialogVisible2 = false;
          that.init();
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'warning'
          });
        }
      })
      .catch(function(err){

      });
    },
    getStorage(){
      var rules = window.sessionStorage.getItem("rules");
      if(rules == '*'){
        this.editIsShow = true;
        this.addIsShow = true;
        return;
      }
      var menuList = JSON.parse(window.sessionStorage.getItem("menuList"));
      for(var i = 0;i < menuList.length;i++){
        if(rules.indexOf(menuList[i]['id'])!=-1){
          if(menuList[i]['action_id']=='role/update'){
            if(menuList[i]['show_button']==1){
              this.editIsShow = true;
            }else{
              this.editIsShow = false;
            }
          }
          if(menuList[i]['action_id']=='role/add'){
            if(menuList[i]['show_button']==1){
              this.addIsShow = true;
            }else{
              this.addIsShow = false;
            }
          }
        }
      }
    },
    menuList1(){
      var params = {},that = this;
        params['token'] = window.sessionStorage.getItem("token");
        params['page'] = 1;
        params['pageSize'] = 20000;
      axios.post(process.env.API_ROOT+'/adminMenu/getlist', qs.stringify(params),{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        var status=res.data.status;
        var adminmenu = [],
            adminprofit = [],
            adminseting = [],
            adminstrator = [],
            agent = [],
            usersponvip = [],
            banner = [],
            comment = [],
            lecturer = [],
            meeting = [],
            message = [],
            order = [],
            role = [],
            share = [],
            site = [],
            sponsor = [],
            system = [],
            ueditor = [],
            umeditor = [],
            commodity = [],
            usercode = [],
            user = [],
            usercard = [],
            withdrawdeposit = [],
            zhimage = [],
            moneystream = [],
            tempArr = [];
        if(status==0){
          var list = res.data.data.list;
          for(var i =0;i<list.length;i++){
            var obj = {
              id:list[i]['id'],
              is_check:false
            }
            list[i]['is_check'] = false
            var controller = list[i]['action_id'].split("/")[0];
            switch(controller)
            {
            case 'adminmenu':
              adminmenu.push(list[i])
              break;
            case 'adminprofit':
              adminprofit.push(list[i])
              break;
            case 'adminseting':
              adminseting.push(list[i])
              break;
            case 'adminstrator':
              adminstrator.push(list[i])
              break;
            case 'agent':
              agent.push(list[i])
              break;
            case 'usersponvip':
              usersponvip.push(list[i])
              break;
            case 'banner':
              banner.push(list[i])
              break;
            case 'comment':
              comment.push(list[i])
              break;
            case 'lecturer':
              lecturer.push(list[i])
              break;
            case 'meeting':
              meeting.push(list[i])
              break;
            case 'message':
              message.push(list[i])
              break;
            case 'order':
              order.push(list[i])
              break;
            case 'role':
              role.push(list[i])
              break;
            case 'share':
              share.push(list[i])
              break;
            case 'commodity':
              commodity.push(list[i])
              break;
            case 'usercard':
              usercard.push(list[i])
              break;
            case 'site':
              site.push(list[i])
              break;
            case 'sponsor':
              sponsor.push(list[i])
              break;
            case 'system':
              system.push(list[i])
              break;
            case 'ueditor':
              ueditor.push(list[i])
              break;
            case 'umeditor':
              umeditor.push(list[i])
              break;
            case 'usercode':
              usercode.push(list[i])
              break;
            case 'user':
              user.push(list[i])
              break;
            case 'withdrawdeposit':
              withdrawdeposit.push(list[i])
              break;
            case 'moneystream':
              moneystream.push(list[i])
              break;
            case 'zhimage':
              zhimage.push(list[i])
              break;
            default:
            }
            that.roleId.push(obj);
          }
          var tempObj = {
            "菜单列表":adminmenu,
            "基础设置":adminseting,
            "登录管理":adminstrator,
            "代理商列表":agent,
            "会议会员权限":usersponvip,
            "banner管理":banner,
            "评论管理":comment,
            "讲师模块":lecturer,
            "会议模块":meeting,
            "消息模块":message,
            "订单模块":order,
            "商品模块":commodity,
            "资源名片模块":usercard,
            "角色模块":role,
            "分享模块":share,
            "主办方模块":sponsor,
            "系统管理模块":moneystream,
            "邀请码模块":usercode,
            "用户管理模块":user,
            "收益模块":withdrawdeposit,
            "上传图片模块":zhimage
          }
          that.roleListData = list;
          that.checkboxData = tempObj;
        }else{
          that.$message({
            showClose: true,
            message: res.data.message,
            type: 'success'
          });
        }
      })
      .catch(function(err){

      });
    },
    getCheckBox(e){
      var id = e.id;
      var data = this.roleId;
      for(var i=0;i<data.length;i++){
        if(data[i].id == id){
          data[i]['is_check'] = !data[i]['is_check'];
        }
      }
      this.checkedRole = data;
    },
    getCheckBoxEdit(e){
      var id = e.id;
      var data = this.roleListData;
      for(var i=0;i<data.length;i++){
        if(data[i].id == id){
          data[i]['is_check'] = !data[i]['is_check'];
        }
      }
      this.editData = data;
    },
    closeView(){
      this.dialogVisible3 = false;
      var checkboxData = this.roleListData;
      for(var i =0;i<checkboxData.length;i++){
        checkboxData[i]['is_check'] = false;
      }
      this.editData = checkboxData;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.roleList-page{
  .check-item{
    margin-right:30px;
    margin-left:0;
  }
}
</style>
