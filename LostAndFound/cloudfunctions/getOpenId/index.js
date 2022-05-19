const cloud = require('wx-server-sdk');

cloud.init({
  env: "cloud1-6g3wbrjx0c3a3ad9"
});

// 获取openId云函数入口函数
exports.main = async (event, context) => {
  // 获取基础信息
  const wxContext = cloud.getWXContext();

  return {
    openid: wxContext.OPENID
  };
};