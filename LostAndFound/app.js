// app.js
App({
  onLaunch() {
    //云开发环境初始化
    wx.cloud.init({
      env: "cloud1-6g3wbrjx0c3a3ad9"
    });
  },
  globalData: {
    imgSrc: '', //发布告示的图片src
    avatar: ''  //编辑资料页的头像
  }
})
