//获取应用实例
const app = getApp();
import { $Toast } from '../../../ui/iview-weapp/dist/base/index';
import api from "../../../api/api"
Page({
  data: {
    dialogShow: false, //展示昵称弹窗
    descShow: false, //展示个签弹窗
    buttons: [{text: '取消'}, {text: '确定'}], //弹窗按钮
    showActionsheet: false,  //展示性别选择框
    groups: [
      { text: '女', value: 0 },
      { text: '男', value: 1 }
    ],
    userInfo: {},
    pwdShow: false, //展示密码弹出框
    sureShow: false, //确定弹出框 
    tempname: '', //临时昵称
    tempdesc: '',  //临时个签
    tempPwd: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo();
  },
  onShow: function() {
    if(app.globalData.avatar) {
      this.setData({
        "userInfo.user_avatar": app.globalData.avatar
      })
    }
  },

  //获取用户信息
  getUserInfo() {
    if(wx.getStorageSync('laf')) {
      const UID = JSON.parse(wx.getStorageSync('laf')).uid;
      api.get(`/api/user/detail`,{id:UID}).then(res => {
        let statusCode = res.data.status;
        if(statusCode == 200) {
          this.setData({
            userInfo: res.data.userInfo
          });
        }
      })
    }
  },

  //选择图片
  handleToCropper(e) {
    wx.navigateTo({
      url: `/packageA/pages/cropper/cropper?avatar=${this.data.userInfo.user_avatar}&type=edit`
    })
  },
  // 展示图片大图
  showImg() {
    this.data.userInfo.user_avatar ? wx.previewImage({urls: [this.data.userInfo.user_avatar]}) : '';
    
  },

  // 1-3-4.显示对话框
  openDialog(e) {
    let {type} = e.target.dataset;
    switch (type) {
      case "sure":
        this.setData({sureShow: true})
        break;
      case "nickname":
        this.setData({dialogShow: true})
        break;
      case "desc":
        this.setData({descShow: true})
        break;
      case "password":
        this.setData({pwdShow: true})
      default: break
    }
    
  },
  // 1.昵称修改框操作
  tapDialogButton(e) {
    let {index} = e.detail;
    if(index === 1 && this.data.tempname != "") {
      this.setData({
        "userInfo.user_nickname": this.data.tempname
      })
    }
    this.setData({dialogShow: false})
  },
  // 1-3.实时展示修改后的昵称
  bindKeyInput: function (e) {
    let {type} = e.target.dataset;
    let value = e.detail.value;
    type == 'tempname' ? this.setData({tempname: value}) : this.setData({tempdesc: value})
  },

  // 2.选择性别
  changeGender(e) {
    this.setData({
      showActionsheet: true
    })
  },
  //性别选择框操作
  actiontap(e) {
    this.setData({
      "userInfo.user_gender": e.detail.value,
      showActionsheet: false
    })
  },

  //3.个性签名
  tapDescButton(e) {
    let {index} = e.detail;
    if(index === 1 && this.data.tempdesc != '') {
      this.setData({
        "userInfo.user_desc": this.data.tempdesc
      })
    }
    this.setData({descShow:false})
  },

  // 4.更新数据库数据
  updataProfile(e) {
    let {index} = e.detail;
    let params = this.data.userInfo;
    if(index === 1) {
      api.post("/api/update/profile",params).then(res => {
        let statusCode = res.data.status;
        if(statusCode == 200) {
          $Toast({
            content: res.data.msg,
            type: 'success'
          });
        }
      }).catch(() => {})
      //返回个人中心
      setTimeout(() => {
        wx.navigateBack();
      },1000)
    }
    this.setData({sureShow: false});
  },
  // 退出登录
  signOut() {
    wx.clearStorage();
    wx.redirectTo({
      url: '/pages/login/login'
    });
  },
})
