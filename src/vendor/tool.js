
import axios from 'axios';
import qs from 'qs';
const debug = process.env.NODE_ENV == 'production';
const BASEURL='http://api.mingchetech.com/';//正式域名
// const BASEURL='http://47.99.87.199/';//测试域名
const IMGBASEURL='https://51njwl.com';
if (debug) {
  axios.defaults.baseURL = BASEURL;//正式域名
}


//注意：uploader和meetingList有请求不经过axios
/*//测试环境要去掉 /backend //
function replaceUrl (url) {
  let newurl=debug?url.replace('/backend',''):url;
  return newurl;
}*/
//拦截请求以添加token
axios.interceptors.request.use(config=>{
  //需要加token的接口
  if(config.url.indexOf('/admin/login')===-1 ){
    if(config.url.indexOf('?')===-1){
      config.url+='?token='+getSession('token');
    }else{
      config.url+='&token='+getSession('token');
    }
  }
  return config;
});
//合并对象
const extend=function (target,source) {
  var obj=target||{};
  for(var i in source){
    if(typeof source[i]==='object' && source[i]){
      obj[i]=source[i].constructor===Array?[]:{};
      extend(obj[i],source[i]);
    }else{
      obj[i]=source[i];
    }
  }
  return obj;
};

axios.defaults.timeout = 40000;//
//post请求
const post=function (url,data,headers) {
  var defaultHd={'Content-Type':'application/json;charset=UTF-8'};
  var head=extend(defaultHd,headers);
  var params=data || {}
  if(head['Content-Type'].indexOf('application/x-www-form-urlencoded')!=-1){
    params=qs.stringify(params);
  }
  return new Promise((resolve,reject)=>{
    axios({
      method:"post",
      url:url,
      data:params,
      headers:head
    }).then((response)=>{
      resolve(response.data);
    }).catch((err)=>{
      reject(err);
    })
  })
};

//put请求
const put=function (url,data,headers) {
  var defaultHd={'Content-Type':'application/json;charset=UTF-8'};
  var head=extend(defaultHd,headers);
  var params=data || {}
  if(head['Content-Type'].indexOf('application/x-www-form-urlencoded')!=-1){
    params=qs.stringify(params);
  }
  return new Promise((resolve,reject)=>{
    axios({
      method:"put",
      url:url,
      data:params,
      headers:head
    }).then((response)=>{
      resolve(response.data);
    }).catch((err)=>{
      reject(err);
    })
  })
};

//get请求
const get=function (url,data) {
  var params=data||{};
  axios.defaults.headers.get['Content-Type']='application/json';
  return new Promise((resolve,reject)=>{
    axios({
      method:"get",
      url:url,
      params:params,
      headers:{
        "Content-Type":"application/json;charset=UTF-8"
      }
    }).then((response)=>{
      resolve(response.data);
    }).catch((err)=>{
      reject(err);
    })
  })
}

//格式化json
const formatJson=function(filterVal, jsonData) {
  return jsonData.map(v => filterVal.map(j => v[j]))
};

//格式化时间
const timeFormat = function(value){
  var date = new Date(parseInt(value*1000));
  var seperator1 = "-";
  var seperator2 = ":";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var hour = date.getHours();
  if (hour >= 0 && hour <= 9) {
    hour = "0" + hour;
  }
  var minute = date.getMinutes();
  if (minute >= 0 && minute <= 9) {
    minute = "0" + minute;
  }
  var second = date.getSeconds();
  if (second >= 0 && second <= 9) {
    second = "0" + second;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate + " " + hour + seperator2 + minute;
  return currentdate;
};

const uploadImg = function(e, callback, limitedSize) {
  e = event ? event : window.event;
  var el = e.target ? e.target : e.srcElement;
  if (!el.files) {
    alert('您的浏览器版本太低，请升级浏览器');
    return;
  }
  var file = el.files[0];
  if (!file) {
    return;
  }
  let uploadImg = null; //图片数据清零
  var limited = limitedSize|| 2; //默认限制上传大小为1MB
  var result = file.name.split('.');
  var suffix = result[result.length - 1];
  if (!/(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(suffix)) {
    this.$store.commit('setToast', '图片格式不正确!请上传gif|jpg|jpeg|png格式');
    return;
  }
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function(e) {
    var size = Math.floor(file.size / 1024 / 1024 * 100) / 100; //单位MB
    if (size < limited) {
      uploadImg = this.result;
      callback(uploadImg, suffix);
    } else {

    }
  }

}
//存储localStorage
const setLocal=function (name, content) {
  if (!localStorage) { return; }
  if (!name) return;
  if (typeof content !== 'string') {
    content = JSON.stringify(content);
  }
  window.localStorage.setItem(name, content);
};

//获取localStorage
const getLocal=function (name) {
  if (!localStorage) { return; }
  if (!name) return;
  return window.localStorage.getItem(name);
};

//删除localStorage
const removeLocal=function (name) {
  if (!localStorage) { return; }
  if (!name) return;
  window.localStorage.removeItem(name);
};
//存储sessionStorage
const setSession=function (name, content) {
  if (!sessionStorage) { return; }
  if (!name) return;
  if (typeof content !== 'string') {
    content = JSON.stringify(content);
  }
  window.sessionStorage.setItem(name, content);
};

//获取sessionStorage
const getSession=function (name) {
  if (!sessionStorage) { return; }
  if (!name) return;
  return window.sessionStorage.getItem(name);
};

//删除sessionStorage
const removeSession=function (name) {
  if (!sessionStorage) { return; }
  if (!name) return;
  window.sessionStorage.removeItem(name);
};


export default {
  debug,
  extend,
  post,
  get,
  put,
  axios,
  qs,
  timeFormat,
  uploadImg,
  formatJson,
  baseUrl:BASEURL,
  imgBaseUrl:IMGBASEURL,
  setLocal,
  getLocal,
  removeLocal,
  setSession,
  getSession,
  removeSession,
}
