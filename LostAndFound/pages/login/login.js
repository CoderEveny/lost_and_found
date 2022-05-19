import api from "../../api/api"
//获取应用实例
const app = getApp()
import { $Toast } from '../../ui/iview-weapp/dist/base/index';
Page({
  data: {
    
  },
  onLoad() {
    //如果不为空，则表明成功登陆,跳转到首页
    if(wx.getStorageSync("laf")) {
      wx.switchTab({
        url: '/pages/index/index',
      });
    }
  },
  //进行登录
  handleToLogin(e) {
    let params = e.detail.value;
    if(!params.useraccount) {
      $Toast({content: '请输入账号'});
      return
    }
    if(!params.password) {
      $Toast({content: '请输入密码'});
      return
    }
    api.post('/api/login',params).then(res => {
      let statusCode = res.data.status;
      if(statusCode == 200) {
        wx.setStorageSync("laf", JSON.stringify({
          token: res.data.token,
          uid: res.data.uid
        }));
        $Toast({
          content: '登录成功',
          type: 'success'
        });
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index',
          });
        },1500)
      } else {
        $Toast({
          content: res.data.msg,
          type: 'warning'
        });
      }
      
    }).catch((err) => {
      console.log("Promise Rejected");
    });
  }
})