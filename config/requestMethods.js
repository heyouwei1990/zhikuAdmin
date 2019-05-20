function request(api,data){  
	axios.post(api, data,{
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(function(res){
        console.log(res)
      })
      .catch(function(err){
        that.$message('登录失败，请联系管理员');
      });
}  
export {  
    request  
}  