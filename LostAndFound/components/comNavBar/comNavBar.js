Component({
  data: {
    statusbar: 0
  },
  properties: {
    navBarH: {
      type: String,
      value: '100px'
    },
    fontSize: {
      type: String,
      value: '40px'
    },
    isShow: {
      type: String,
      value: "block"
    }
  },
  // 组件完全初始化完成
  attached() {
    // 获取状态栏高度
    let res = wx.getSystemInfoSync();
    let statusbarH = res.statusBarHeight;
    this.setData({
      statusbar: statusbarH
    })
  },
  methods: {}
})