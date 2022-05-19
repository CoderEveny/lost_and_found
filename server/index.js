const express = require("express");
const app = express();
const router = require("./router");
//接收post发送过来的参数,不需要install
const bodyparser = require("body-parser");
//引入cors跨域配置
const cors = require("cors")

//处理跨域
app.use(cors())
//配置接收post发送的参数
app.use(bodyparser.urlencoded({
    extended: true
}))
app.use("/api",router);

app.listen(5000, () => {
	console.log("服务器运行在5000端口")
})
