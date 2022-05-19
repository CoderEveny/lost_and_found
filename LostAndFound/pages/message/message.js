import api from "../../api/api";
Page({
  data: {
    list: [],
    topNum: 0, //回到顶部
    page: 1,
    pageSize: 10,  //每次返回多少条数据
    loadingshow: false,
    triggered: false,
  },
  async onLoad() {
    wx.showLoading({
      title: '加载中',
    })
  },
  onReady() {
    wx.hideLoading();
  },
  async onShow() {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    await this.getChatList()
  },
  handleToChat(e) {
    const {receiveid,roomid} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/packageA/pages/chatpage/chatpage?roomID=${roomid}&receiveID=${receiveid}`,
    });
  },

  //页面上拉触底事件的处理函数
  async loadMore() {
    this.setData({loadingshow: true})
    await this.getChatList();
  },

  // 下拉刷新
  async refresh() {
    this.setData({
      list: [],
      page: 1
    })
    await this.getChatList();
  },

  // 获取聊天列表
  async getChatList() {
    const UID = JSON.parse(wx.getStorageSync('laf')).uid;
    let {page,pageSize,list} = this.data;
    await api.get("/api/chatlist/info",{uid:UID,page,pageSize}).then(res => {
      const statusCode = res.data.status;
      if(statusCode == 200) {
        list.push(...res.data.list);
        res.data.list.length == 0 ? page : page += 1;
        this.setData({
          list,
          page,
          loadingshow: false,
          triggered: false
        })
      }
    }).catch(() => {})
  },

})