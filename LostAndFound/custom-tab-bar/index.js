import api from '../api/api'
Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        iconPath: 'icon-shouye',
        text: "首页"
      },
      {
        pagePath: '/pages/bulletin/bulletin',
        iconPath: 'icon-gonggao',
        text: "公告栏"
      },
      {
        pagePath: '/pages/message/message',
        iconPath: 'icon-message',
        text: "消息"
      }
    ]
  },
  properties: {},
  methods: {
    switchTab(e) {
      let data = e.currentTarget.dataset;
      let url = data.path;
      wx.switchTab({url});
      this.setData({
        selected: data.index
      })
    },
    // 跳转到个人中心
    handleToProfile() {
      wx.navigateTo({
        url: `/pages/profile/profile`
      });
    }
  }
})