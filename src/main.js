// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
// import Validator from 'vue-validator'
// Vue.use(Validator)
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import ZkTable from 'vue-table-with-tree-grid'
import router from './router'
import store from './store'

import $ from '../config/jquery'
import '../static/UE/ueditor.config';
import '../static/UE/ueditor.all';
import tool from '@/vendor/tool'

Vue.use(ElementUI);
Vue.use(ZkTable);
Vue.prototype.$post=tool.post;
Vue.prototype.$get=tool.get;
Vue.prototype.$put=tool.put;

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

router.beforeEach((to, from, next) => {
    var token = window.sessionStorage.getItem("token");
    if (to.path == '/') {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("rules");
        sessionStorage.removeItem("menuList");
    }
    if (!token && to.path != '/') {
        next({ path: '/' })
    } else {
        next()
    }
});
//给日期类添加一个方法
Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()            //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}
