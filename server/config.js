//1.引入mysql依赖
const mysql = require("mysql");
//2.创建数据库连接
const client = mysql.createConnection({
  host: "127.0.0.1", //主机地址
  user: "root", //数据库名字
  password: "123456", //数据库密码
  database: "lost_and_found" //连接到那个数据库
})

/**
* query执行数据库语句的方法
* 参数：sql-数据库语句
*      params-数据库语句的参数
*      callback(error,result)-响应结果的回调函数
*/
module.exports = function sqlFn(sql,params,callback) {
  client.query(sql,params,(error,result) => {
      if(error) { //发生错误直接返回
          console.log(error);
          return; 
      }
      callback(result)
  })
}
