import api from "../../api/api";
Page({
  data: {
    tabs: [
      {
        id: 0,
        value: "寻找中",
        isActive: true,
        name: "finding"
      },
      {
        id: 1,
        value: "已发现",
        isActive: false,
        name: "found"
      }
    ],
    tabsStyle: {
      background: "var(--themeTabsBgColor)",
      color: "#fff",
      activeColor: "#05e1ec"
    },
    topNum: 0, //回到顶部
    lossList: {
      finding: {page: 1,list: [],status: 0}, //寻找中列表
      found: {page: 1,list:[],status: 1} //已发现列表
    },
    pageSize: 4,  //每次返回多少条数据
    type: 'finding',  //寻找中：0，已发现：1,但是用id匹配name
    loadingshow: false,
    triggered: false,
    statusbar:0
  },

  async onLoad(e) {
    let res = wx.getSystemInfoSync()
    let statusbarH = res.statusBarHeight
    this.setData({
        statusbar: statusbarH
    })
    await this.getLossList("finding");
    await this.getLossList("found");
  },

  //为了使下面tabbar状态正常 
  onShow() {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    this.refresh()
  },
  // 接收tabs事件,修改状态，回到顶部
  async tabsItemChange(e) {
    let {tabs,index} = e.detail;
    this.setData({
      tabs,
      topNum:0,
      type: tabs[index].name
    })
  },

  //页面上拉触底事件的处理函数
  async loadMore() {
    this.setData({loadingshow: true})
    await this.getLossList(this.data.type);
  },

  // 下拉刷新
  async refresh() {
    let {type} = this.data;
    if(type == 'finding') {
      this.setData({
        "lossList.finding.list": [],
        "lossList.finding.page": 1
      })
    } else {
      this.setData({
        "lossList.found.list": [],
        "lossList.found.page": 1
      })
    }
    await this.getLossList(type);
  },

  // 分页信息获取
  async getLossList(type) {
    let {pageSize,lossList} = this.data;
    let {status,page,list} = lossList[type]
    await api.get("/api/loss/bulletin",{status,page,pageSize}).then(res => {
      let statusCode = res.data.status;
      if(statusCode == 200) {
        list.push(...res.data.lossList);
        res.data.lossList.length == 0 ? page : page += 1;
        type == 'finding' ? this.setData({'lossList.finding.list':list,'lossList.finding.page': page}) : this.setData({'lossList.found.list':list,'lossList.found.page': page});
        this.setData({loadingshow: false,triggered: false});
      }
    }).catch(() => {})
  },

  // 去搜索页面
  toSearch() {
    wx.navigateTo({
      url: '/packageA/pages/search/search'
    }) 
  }
})