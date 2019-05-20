import axios from 'axios';
import qs from 'qs'

var getImageRootUrl = window.sessionStorage.getItem("getImageRootUrl");
var data;

	var params={
		token:window.sessionStorage.getItem("token")
	}
	// var data;
	var baseUrl=process.env.API_ROOT.replace('/api1','');
	axios.post(baseUrl+'/Zhimage/getImageRootUrl', qs.stringify(params),
		{headers:{
		  'Content-Type': 'application/x-www-form-urlencoded'
		}}).then(function(res){
			data = res.data.data;
		})
	.catch(function(err){

	});
export const imgUrl = () => { return data };

export const getMemberList = params => { return axios.post(process.env.API_ROOT+'/user/index', qs.stringify(params)).then(res => res.data); };

export const timeFormat = (value) =>{
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
}

