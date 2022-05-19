//获取应用实例
const app = getApp();
import { $Toast } from '../../ui/iview-weapp/dist/base/index';
import api from "../../api/api"
Page({
  data: {
    radio: [
      {name: '寻找中',value : 0},
      {name: '已发现', value: 1}
    ],
    buttons: [{text: '取消'}, {text: '确定'}], //弹窗按钮
    sureShow: false, //确定弹出框 
    // 设置裁剪框
    picPath: '', //图片
    showPic: false, //展示图片
    currentIndex: 0,
    tempdate: '',     //临时存储日期
    lossInfo: {},  //告示信息
    temp: '',  //用于清空表单
    type: ''   //告示类型
  },
  onLoad: function(e) {
    e.type == 'finding' ? this.setData({currentIndex: 0}) : this.setData({currentIndex: 1})
    this.setData({type: e.type})
  },
  onShow: function() {
    //为了使 tabbar的 active样式不延迟
    if(typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    };
    if(app.globalData.imgSrc) {
      this.setData({
        picPath: app.globalData.imgSrc,
        showPic: true
      })
    }
  },

  //提交事件
  async handleSubmit(e) {
    let formInfo = e.detail.value;
    const UID = JSON.parse(wx.getStorageSync('laf')).uid;
    let total = {...formInfo,...this.data.userInfo};
    total.pic = this.data.picPath;
    total.publish_date = +new Date();
    total.uid = UID;
    total.status = this.data.currentIndex;
    this.setData({
      sureShow: true,
      lossInfo: total
    });
  },
  uploadBulletin(e) {
    let {index} = e.detail;
    let {lossInfo} = this.data;
    let that = this;
    if(index === 1) {
      let msg = that.handleMust(lossInfo)
      if(msg == "ok") {
        api.post("/api/publish",lossInfo).then(res => {
          let statusCode = res.data.status;
          if(statusCode == 200) {
            $Toast({
              content: res.data.msg,
              type: 'success'
            });
            that.clearImg(); //清空图片
            that.setData({temp: '',date: ''}); //清空日期、表单内容
            setTimeout(() => {
              wx.navigateBack();
            },1000)
          }
        }).catch(() => {})
      } else {
        $Toast({
          content: msg,
          type: 'fail'
        });
      }
    }
    this.setData({sureShow: false});
  },

  // 删除图片
  clearImg() {
    this.setData({
      showPic: false,
      picPath: ''
    });
    // 清空globalData的路径
    app.globalData.imgSrc = ''
  },

  // 展示图片大图
  previewImage(e) {
    wx.previewImage({
      // current: this.data.picPath,    // 当前显示图片的http链接
      urls: [this.data.picPath] // 需要预览的图片http链接列表
    }) 
  },
  //上传图片
  handleToCropper() {
    wx.navigateTo({
      url: `/packageA/pages/cropper/cropper?imgSrc=${this.data.picPath}&type=publish`
    })
  },

  //表单重置事件触发
  handleReset() {
    this.clearImg();
    this.setData({tempdate: ''})
  },  

  //  点击日期组件确定事件
  bindDateChange: function (e) {
    this.setData({
      tempdate: e.detail.value
    })
  },

  // 处理必填选项(小程序没有required)
  handleMust(info) {
    if(!info.name) {
      return "请填写物品名称！"
    }
    if(!info.pic) {
      return "请上传物品图片！"
    }
    if(!info.contact) {
      return "请填写联系方式！"
    }
    if(info.status == 1) {
      if(!info.place) {return "请填写发现地点！"};
      if(!info.date) {return "请选择发现日期！"}
    }
    return "ok"
  }
})
