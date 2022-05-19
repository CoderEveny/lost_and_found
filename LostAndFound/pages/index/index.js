import api from "../../api/api"
Page({
  data: {
    selected: 0,
    show: false,
  },
  onShow: function() {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    };
    this.setData({show: false})
  },
  // 跳转tab页面
  switchTab(e) {
    let data = e.currentTarget.dataset;
    let url = data.path;
    wx.switchTab({url});
    this.setData({
      selected: data.index
    })
  },
  // 展示弹出层
  showBtn() {
    this.setData({
      show: true
    })
  },
  toPublish(e) {
    let {type} = e.target.dataset;
    wx.navigateTo({
      url: `/pages/publish/publish?type=${type}`
    })
  }
})
