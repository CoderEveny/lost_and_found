Component({
  data: {},
  properties: {
    tabs: {
      type: Array,
      value: []
    },
    tabsStyle: {
      type: Object,
      value: {}
    }
  },
  methods: {
    handleItemTap(e) {
      let {index} = e.currentTarget.dataset;
      let tabs = this.data.tabs;
      tabs.forEach((v,i) =>  v.isActive = i === index)
      // 向父组件发送事件
      this.triggerEvent("tabsItemChange", {tabs,index})
    }
  }
})