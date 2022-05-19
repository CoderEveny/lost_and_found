import api from "../../api/api"
Page({
  data: {
    statusbar: 0,
    userInfo: {}, //用户信息
    tabs: [
      {
        id: 0,
        value: "进行中",
        isActive: true,
        name: "ongoing"
      },
      {
        id: 1,
        value: "已完成",
        isActive: false,
        name: "done"
      },
      {
        id: 2,
        value: "揭取榜",
        isActive: false,
        name: "take"
      },
      {
        id: 3,
        value: "未通过",
        isActive: false,
        name: "reject"
      }
    ],
    tabsStyle: {
      background: "#f4f4f4",
      color: "#000",
      activeColor: "#07a9f5"
    },
    topNum: 0, //回到顶部
    lossList: {
      ongoing: {page: 1,list: []}, //进行中列表
      done: {page: 1,list:[]}, //已完成列表
      take: {page: 1,list: []}, //揭取榜列表
      reject: {page: 1,list: []}
    },
    pageSize: 6,
    type: 'ongoing',
    loadingshow: false,
    triggered: false
  },
  async onLoad(e) {
    let res = wx.getSystemInfoSync()
    let statusbarH = res.statusBarHeight
    this.setData({
        statusbar :statusbarH,
    });
    await this.getUserInfo();
    await this.getListInfo("ongoing");
    await this.getListInfo("done");
    await this.getListInfo("take");
    await this.getListInfo("reject");
  },
  async onShow() {
    await this.getUserInfo();
    this.refresh()
  },
  // 切换tabs
  tabsItemChange(e) {
    let {tabs,index} = e.detail;
    this.setData({
      tabs,
      type: tabs[index].name
    })
  },
  // 跳转到个人信息修改页面
  handleToChange() {
    wx.navigateTo({
      url: '/packageA/pages/editprofile/editprofile'
    });
  },

  async getUserInfo() {
    if(wx.getStorageSync('laf')) {
      const UID = JSON.parse(wx.getStorageSync('laf')).uid;
      await api.get(`/api/user/detail`,{id:UID}).then(res => {
        let statusCode = res.data.status;
        if(statusCode == 200) {
          this.setData({
            userInfo: res.data.userInfo
          });
        }
      })
    }
  },

  // 下拉刷新
  async refresh() {
    let {type} = this.data;
    switch (type) {
      case "ongoing":
        this.setData({
          "lossList.ongoing.list": [],
          "lossList.ongoing.page": 1
        })
        break;
      case "done":
        this.setData({
          "lossList.done.list": [],
          "lossList.done.page": 1
        })
        break;
      case "take":
        this.setData({
          "lossList.take.list": [],
          "lossList.take.page": 1
        })
        break;
      case "reject":
        this.setData({
          "lossList.reject.list": [],
          "lossList.reject.page": 1
        })
        break;
      default:break;
    }
    await this.getListInfo(type);
  },

  //页面上拉触底事件的处理函数
  async onReachBottom() {
    this.setData({loadingshow: true})
    await this.getListInfo(this.data.type);
    console.log("上拉")
  },

  //获取用户的告示表信息
  async getListInfo(type) {
    let {pageSize,lossList} = this.data;
    let {uid} = this.data.userInfo;
    let {page,list} = lossList[type];
    let path = this.getPath(type);
    await api.get(path,{uid,page,pageSize}).then(res => {
      let statusCode = res.data.status;
      if(statusCode == 200) {
        list.push(...res.data.list);
        res.data.list.length == 0 ? page : page += 1;
        switch (type) {
          case "ongoing":
            this.setData({'lossList.ongoing.list':list,'lossList.ongoing.page': page})
            break;
          case "done":
            this.setData({'lossList.done.list':list,'lossList.done.page': page});
            break;
          case "take": 
            this.setData({'lossList.take.list':list,'lossList.take.page': page});
            break;
          case "reject":
            this.setData({'lossList.reject.list':list,'lossList.reject.page': page})
          default:break;
        }
        this.setData({loadingshow: false,triggered: false})
      }
    }).catch(() => {})
  },
  // 获取请求路径
  getPath(type) {
    switch (type) {
      case "ongoing":
        return "/api/profile/bulletin/ongoing"
      case "done":
        return "/api/profile/bulletin/done"
      case "take":
        return "/api/profile/bulletin/take"
      case "reject":
        return "/api/profile/bulletin/reject"
      default: break;
    }
  }
})
