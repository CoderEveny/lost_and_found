Component({
  data: {
    statusbar: 0,
  },
  properties: {
    list: {
      type: Array,
      value: [],
    },
    itemBgColor: {
      type: String,
      value: "var(--themeLossBgColor)"
    },
    itemElseBgColor: {
      type: String,
      value: "var(--themeColor)"
    }
  },
  methods: {
    handleToDetail(e) {
      let {id} = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/packageA/pages/lossdetail/lossdetail?id=${id}`
      });
    }
  }
})