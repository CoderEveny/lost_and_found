Component({
  data: {},
  properties: {},
  methods: {
    // 返回上一级
    backEvent() {
      wx.navigateBack();
      /**
       * 触发返回操作
       * triggerEvent函数接受三个值：事件名称、数据{}、选项值{}  
       */
      this.triggerEvent("back",{}, {})
    }
  },
  attached() {
    let res = wx.getSystemInfoSync()
    let statusbarH = res.statusBarHeight
    this.setData({
      statusbar: statusbarH
    })
  },
})