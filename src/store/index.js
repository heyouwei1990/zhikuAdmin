import Vue from 'vue'
import vuex from 'vuex'
import tool from '@/vendor/tool'
Vue.use(vuex);
export default new vuex.Store({
  state:{
    meetingTypeList:[],//会议分类列表全部数据
    provinceList:[],
    roleList:[],
    cardTypes:[],
    menuList:[],
    rules:''
  },
  getters:{

  },
  mutations:{
    setMeetingTypeList(state,value){
      state.meetingTypeList=value;
    },
    setProvinceList(state,value){
      state.provinceList=value;
    },
    setRoleList(state,value){
      state.roleList=value;
    },
    setCardTypes(state,value){
      state.cardTypes=value;
    },
    setMenuList(state,value){
      state.menuList=value;
    },
    setRules(state,value){
      state.rules=value?value:'';
    }
  },
  actions:{
    //会议类型
    getMeetingTypeList(context){
      tool.get('/backend/meeting/typeAll').then(r=>{
        if(r.status==0){
          context.commit('setMeetingTypeList',r.data);
        }else{
          alert(r.message);
        }
      }).catch(err=>{
        alert(err.message);
      })
    },
    //获取省份
    getProvinceList({ commit }){
      tool.get('/backend/user/provinceList').then(r=>{
        if(r.status==0){
          commit('setProvinceList',r.data);
        }else{
          alert(r.message);
        }
      }).catch(err=>{
        alert(err.message);
      })
    },

    //获取省份
    getRoleList({ commit }){
      tool.get('/backend/adminRole/getAll').then(r=>{
        if(r.status==0){
          commit('setRoleList',r.data);
        }else{
          alert(r.message);
        }
      }).catch(err=>{
        alert(err.message);
      })
    },
    //名片类型
    getCardTypes(context){
      tool.get('/backend/userCardType/typeAll').then(r=>{
        if(r.status==0){
          let list=r.data;
          if(list.length>2){
            list=list.sort(function (a,b) {
              return a.id-b.id;
            })
          }
          context.commit('setCardTypes',list);
        }else{
          alert(r.message);
        }
      }).catch(err=>{
        alert(err.message);
      })
    },
    //获取全部菜单
    getMenuList(context){
      tool.get('/backend/adminMenu/list',{
        startPage:1,
        pageSize:200,
      }).then(r=>{
        if(r.status==0){
          context.commit('setMenuList',r.data);
          tool.setSession('menuList',r.data);
        }
      })
    }
  }
})

