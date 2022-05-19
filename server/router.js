const express = require("express");
const router = express.Router();
//引入token
const jwt = require("jsonwebtoken");
// 引入封装好的数据库方法
const sqlFn = require("./config");
const key = require("./secretkey");

/**
 * 用户登录接口
 */
router.post("/login",(req,res) => {
  const {useraccount,password} = req.body;
  const sql = "select * from users where user_account=? and user_password=?";
  const params = [useraccount,password];
  sqlFn(sql, params, result => {
    if(result.length > 0) {
      const token = jwt.sign({
          uid: result[0].uid,
          nickname: result[0].user_nickname
      },key.secretKey)
      res.send({
        status: 200,
        uid: result[0].uid,
        token
      })
    } else {
      res.send({
        status: 404,
        msg: "用户名密码错误"
      })
    }
  })
});

/**
 * 获取用户信息,带query参数：id
 */
router.get("/user/detail",(req,res) => {
  const uid = req.query.id;
  const token = req.headers["access-token"] || '';
  const sql = "select uid,user_avatar,user_nickname,user_desc,user_gender from users where uid=?";
  const params = [uid];
  if(token) {
    sqlFn(sql, params, result => {
      if(result.length > 0) {
        res.status(200).json({
          status: 200,
          userInfo: result[0],
        })
      } else {
        res.send({
          status: 404,
          msg: "查无此信息"
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
})

/**
 * 更新用户数据
 */
router.post("/update/profile",(req,res) => {
  const {uid,user_avatar,user_nickname,user_desc,user_gender} = req.body;
  const token = req.headers["access-token"] || '';
  const sql = "update users set user_avatar=?,user_nickname=?,user_gender=?,user_desc=? where uid=?";
  const params = [user_avatar,user_nickname,user_gender,user_desc,uid];
  if(token) {
    sqlFn(sql, params, result => {
      if(result.affectedRows > 0) {
        res.status(200).json({
          status: 200,
          msg: "资料修改成功"
        })
      } else {
        res.send({
          status: 404,
          msg: "查无此信息"
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
});

/**
 * 上传告示信息
 */
router.post("/publish",(req,res) => {
  const {name,status,place,date,contact,desc,uid,pic,publish_date} = req.body;
  const token = req.headers["access-token"] || '';
  const sql = "insert into losses values(null,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const params = [name,status,place,date,contact,desc,pic,publish_date,uid,0,0,0,0,"null"];
  if(token) {
    sqlFn(sql, params, result => {
      if(result.affectedRows > 0) {
        res.status(200).json({
          status: 200,
          msg: "告示发布成功"
        })
      } else {
        res.send({
          status: 404,
          msg: "发布失败"
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
});

/**
 * 获取告示列表信息，参数： type-已发现：1,；寻找中：0
 * 分页： currentPage-当前页数， pageSize-每页获取多少条
 */
router.get("/loss/bulletin",(req,res) => {
  const {status} = req.query;
  const token = req.headers["access-token"] || '';
  let page = parseInt(req.query.page) || 1;  //无输入默认第一页
  let pageSize = parseInt(req.query.pageSize) || 2;     //无输入默认两条
  let offset = (page - 1) * pageSize;
  const sql = `select id,loss_name,loss_pic,loss_status,loss_place,L.uid,L.isReview,L.isTake,U.user_nickname,publish_date 
  from losses as L inner join users as U 
  on loss_status=? and isdel=0 and L.uid = U.uid and L.isReview=1
  order by publish_date DESC
  limit ${offset},${pageSize}`;
  const params = [status];
  if(token) {
    sqlFn(sql,params,result => {
      if(result.length > 0) {
        res.status(200).json({
          status: 200,
          lossList: result,
          pagination: {
            currentPage: page,
            pageSize: pageSize
          }
        })
      } else {
        res.send({
          status: 200,
          lossList: []
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
})


/**
 * 获取具体告示详情信息，id = ?
 */
router.get("/loss/bulletin/detail",(req,res) => {
  const {id} = req.query;
  const token = req.headers["access-token"] || '';
  const sql = `SELECT L.*,U.user_nickname,U.user_avatar,UU.user_nickname AS receiver_nickname,UU.user_avatar AS receiver_avatar
  FROM losses AS L 
  INNER JOIN users AS U ON L.uid = U.uid
  LEFT JOIN(
  SELECT L.id,U.user_nickname,U.user_avatar
  FROM losses AS L
  INNER JOIN users AS U ON L.receiver_uid = U.uid AND L.receiver_uid != 0
  ) AS UU
  ON UU.id = L.id
  WHERE L.id=? AND isdel=0`;
  const params = [id]
  if(token) {
    sqlFn(sql,params,result => {
      if(result.length > 0) {
        res.status(200).json({
          status: 200,
          lossInfo: result[0],
        })
      } else {
        res.send({
          status: 404,
          msg: "查无此信息"
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
})

/**
 * 查找用户个人的告示  已完成
 * 用户uid=?, 告示状态 status=2 
 */
router.get("/profile/bulletin/done",(req,res) => {
  const token = req.headers["access-token"] || '';
  const {uid} = req.query;
  let page = parseInt(req.query.page) || 1;  //无输入默认第一页
  let pageSize = parseInt(req.query.pageSize) || 2;     //无输入默认两条
  let offset = (page - 1) * pageSize;
  const sql = `SELECT L.id,loss_name,loss_status,loss_pic,loss_place,U.user_nickname,publish_date 
  FROM losses AS L INNER JOIN users AS U 
  ON loss_status=2 AND isdel=0 AND L.uid=? AND L.uid = U.uid
  order by publish_date DESC
  limit ${offset},${pageSize}`;
  const params = [uid];
  if(token) {
    sqlFn(sql,params,result => {
      if(result.length > 0) {
        res.status(200).json({
          status: 200,
          list: result,
          pagination: {
            currentPage: page,
            pageSize: pageSize
          }
        })
      } else {
        res.send({
          status: 200,
          list: []
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
})

/**
 * 查找用户个人的告示  进行中
 * 用户uid=?, status!=2
 */
 router.get("/profile/bulletin/ongoing",(req,res) => {
  const token = req.headers["access-token"] || '';
  const {uid} = req.query;
  let page = parseInt(req.query.page) || 1;  //无输入默认第一页
  let pageSize = parseInt(req.query.pageSize) || 2;     //无输入默认两条
  let offset = (page - 1) * pageSize;
  const sql = `SELECT L.id,loss_name,loss_pic,loss_status,loss_place,L.isReview,L.isTake,U.user_nickname,publish_date 
  FROM losses AS L INNER JOIN users AS U 
  on loss_status!=2 and isdel=0 and L.uid=? and L.uid = U.uid and L.isReview !=2
  order by publish_date DESC
  limit ${offset},${pageSize}`;
  const params = [uid];
  if(token) {
    sqlFn(sql,params,result => {
      if(result.length > 0) {
        res.status(200).json({
          status: 200,
          list: result,
          pagination: {
            currentPage: page,
            pageSize: pageSize
          }
        })
      } else {
        res.send({
          status: 200,
          list: []
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
})

/**
 * 查找用户个人的告示  揭取榜
 * 用户uid=?, status!=2
 */
 router.get("/profile/bulletin/take",(req,res) => {
  const token = req.headers["access-token"] || '';
  const {uid} = req.query;
  let page = parseInt(req.query.page) || 1;  //无输入默认第一页
  let pageSize = parseInt(req.query.pageSize) || 2;     //无输入默认两条
  let offset = (page - 1) * pageSize;
  const sql = `SELECT L.id,loss_name,loss_pic,loss_status,loss_place,L.isReview,L.isTake,U.user_nickname,publish_date 
  FROM losses AS L INNER JOIN users AS U 
  on loss_status!=2 and isdel=0 and L.receiver_uid=? and L.uid = U.uid
  order by publish_date DESC
  limit ${offset},${pageSize}`;
  const params = [uid];
  if(token) {
    sqlFn(sql,params,result => {
      if(result.length > 0) {
        res.status(200).json({
          status: 200,
          list: result,
          pagination: {
            currentPage: page,
            pageSize: pageSize
          }
        })
      } else {
        res.send({
          status: 200,
          list: []
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
})
/**
 * 查找用户个人的告示  未通过
 * 用户uid=?, isReview=2
 */
 router.get("/profile/bulletin/reject",(req,res) => {
  const token = req.headers["access-token"] || '';
  const {uid} = req.query;
  let page = parseInt(req.query.page) || 1;  //无输入默认第一页
  let pageSize = parseInt(req.query.pageSize) || 2;     //无输入默认两条
  let offset = (page - 1) * pageSize;
  const sql = `SELECT L.id,loss_name,loss_pic,loss_status,loss_place,L.isReview,L.isTake,U.user_nickname,publish_date 
  FROM losses AS L INNER JOIN users AS U 
  ON L.uid = U.uid AND L.isReview=2 AND L.uid=? AND L.isdel=0
  order by publish_date DESC
  limit ${offset},${pageSize}`;
  const params = [uid];
  if(token) {
    sqlFn(sql,params,result => {
      if(result.length > 0) {
        res.status(200).json({
          status: 200,
          list: result,
          pagination: {
            currentPage: page,
            pageSize: pageSize
          }
        })
      } else {
        res.send({
          status: 200,
          list: []
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
})

/**
 * 更改告示状态 2-完成
 */
 router.post("/update/bulletin",(req,res) => {
  const {id} = req.body;
  const token = req.headers["access-token"] || '';
  const sql = "update losses set loss_status=2 where id=?";
  const params = [id];
  if(token) {
    sqlFn(sql, params, result => {
      if(result.affectedRows > 0) {
        res.status(200).json({
          status: 200,
          msg: "告示完成！"
        })
      } else {
        res.send({
          status: 404,
          msg: "操作失败"
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
});

/**
 * 更改告示揭取状态：1-被揭取
 */
 router.post("/take/bulletin",(req,res) => {
  const {id,uid} = req.body;
  const token = req.headers["access-token"] || '';
  const sql = "update losses set isTake=1,receiver_uid=? where id=?";
  const params = [uid,id];
  if(token) {
    sqlFn(sql, params, result => {
      if(result.affectedRows > 0) {
        res.status(200).json({
          status: 200,
          msg: "告示揭取成功！"
        })
      } else {
        res.send({
          status: 404,
          msg: "操作失败"
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
});

/**
 * 搜索功能，模糊查询
 * select * from table1 where name like '%明%'
 */
 router.get("/search",(req,res) => {
  const token = req.headers["access-token"] || '';
  const {key} = req.query;
  let page = parseInt(req.query.page) || 1;  //无输入默认第一页
  let pageSize = parseInt(req.query.pageSize) || 2;     //无输入默认两条
  let offset = (page - 1) * pageSize;
  const sql = `select L.id,loss_name,loss_pic,loss_place,U.user_nickname,publish_date 
  from losses AS L INNER JOIN users AS U 
  on loss_name like '%${key}%' and loss_status!=2 and isdel=0 and L.uid = U.uid and L.isReview=1
  order by publish_date DESC
  limit ${offset},${pageSize}`;
  const params = [key];
  if(token) {
    sqlFn(sql,params,result => {
      if(result.length > 0) {
        res.status(200).json({
          status: 200,
          list: result,
          pagination: {
            currentPage: page,
            pageSize: pageSize
          }
        })
      } else {
        res.send({
          status: 200,
          list: []
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
})

/**
 * 删除告示 isdel=1
 */
 router.post("/del/bulletin",(req,res) => {
  const {id} = req.body;
  const token = req.headers["access-token"] || '';
  const sql = "update losses set isdel=1 where id=?";
  const params = [id];
  if(token) {
    sqlFn(sql, params, result => {
      if(result.affectedRows > 0) {
        res.status(200).json({
          status: 200,
          msg: "删除成功！"
        })
      } else {
        res.send({
          status: 404,
          msg: "操作失败"
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
});

/**
 * 添加聊天列表 admin_uid:主用户uid；chat_uid:聊天对象uid;
 *  date:关系创建时间; roomID:聊天室ID
 */
router.post("/add/chatlist",(req,res) => {
  const {admin_uid,chat_uid,roomID,date} = req.body;
  const token = req.headers["access-token"] || '';
  const sql= `INSERT INTO chat_list VALUES(NULL,?,?,?,?)`;
  const params = [admin_uid,chat_uid,roomID,date];
  if(token) {
    sqlFn(sql, params, result => {
      if(result.affectedRows > 0) {
        res.status(200).json({
          status: 200,
          msg: "添加成功！"
        })
      } else {
        res.send({
          status: 404,
          msg: "添加失败"
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
})

/**
 * 查找主用户的聊天列表
 */
router.get("/chatlist/info",(req, res) => {
  const {uid} = req.query;
  const token = req.headers["access-token"] || '';
  let page = parseInt(req.query.page) || 1;  //无输入默认第一页
  let pageSize = parseInt(req.query.pageSize) || 10;     //无输入默认两条
  let offset = (page - 1) * pageSize;
  const sql= `select U.uid,U.user_nickname,U.user_avatar,C.roomID,C.create_date
  from chat_list AS C INNER JOIN users AS U 
  on C.chat_uid=U.uid and C.admin_uid=?
  order by create_date DESC
  limit ${offset},${pageSize}`;
  const params = [uid];
  if(token) {
    sqlFn(sql, params, result => {
      if(result.length > 0) {
        res.status(200).json({
          status: 200,
          list: result
        })
      } else {
        res.send({
          status: 200,
          list: []
        })
      }
    })
  } else {
    res.send({
      status: 401,
      msg: "请先登录!"
    })
  }
})

/**
 * 管理员端数据接口
 */

/**
 * 管理员登录
 */
 router.post("/login/admin",(req,res) => {
  // 由于前端数据在requestpayload里，Request Payload方式是以“流“”的方式出入到后台，需要监听data事件来获取完整的数据。
  let str = "";
  req.on("data",function(chunk){
    str+=chunk 
  })
  req.on("end",function(){
    const obj = JSON.parse(str)
    const sql = "select * from admin where account=? and password=?";
    const params = [obj.account,obj.password];
    sqlFn(sql, params, result => {
      if(result.length > 0) {
        const token = jwt.sign({
          timeTS: +new Date()
        },key.secretKey)
        res.send({
          code: 0,
          message: "登录成功"
        })
      } else {
        res.send({
          code: 404,
          msg: "账号密码错误"
        })
      }
    })
  });
});

/**
 * 管理员端告示信息
*/
router.get("/admin/losses",(req,res) => {
  const sql = `select * from losses 
  order by publish_date DESC`;
  const params = [];
  sqlFn(sql, params, result => {
    if(result.length > 0) {
      res.send({
        code: 200,
        data: result
      })
    } else {
      res.status(200).json({
        code: 200,
        msg: "暂无信息"
      })
    }
  })
})

/**
 * 处理审核： 通过-1，拒绝-2
 */
router.post("/admin/review",(req,res) => {
  let str = "";
  req.on("data",function(chunk){
    str+=chunk 
  })
  req.on("end",function(){
    const obj = JSON.parse(str)
    const sql = "update losses set isReview=?,review_reason=? where id=?";
    const params = [obj.status,obj.reason,obj.id];
    sqlFn(sql, params, result => {
      if(result.affectedRows > 0) {
        res.send({
          code: 200,
          message: "操作成功"
        })
      } else {
        res.send({
          code: 404,
          msg: "操作失败"
        })
      }
    })
  });
})
/**
 * 处理删除
 */
 router.post("/admin/delete",(req,res) => {
  let str = "";
  req.on("data",function(chunk){
    str+=chunk 
  })
  req.on("end",function(){
    const obj = JSON.parse(str)
    const sql = "delete from losses where id=?";
    const params = [obj.id];
    sqlFn(sql, params, result => {
      if(result.affectedRows > 0) {
        res.send({
          code: 200,
          message: "删除成功"
        })
      } else {
        res.send({
          code: 404,
          msg: "删除失败"
        })
      }
    })
  });
})

module.exports = router