import api from "../../../api/api";
Page({
  data: {
    extClass: {
      containerClass: 'mp-searchbar-container',
      cancleTextClass: 'mp-searchbar-cancletext',
      formClass:'mp-searchbar-form'
    },
    value: '',
    page: 1,
    list: [],
    pageSize: 4,
    loadingshow: false
  },
  // 加载更多
  async loadMore() {
    this.setData({loadingshow: true});
    await this.getInfoList()
  },
  // 搜索按钮
  async searchLoss() {
    if(!this.data.value) {
      return;
    }
    await this.getInfoList()
  },
  async getInfoList() {
    let {value,page,pageSize,list} = this.data;
    await api.get("/api/search",{key: value,page,pageSize}).then(res => {
      const statusCode = res.data.status;
      if(statusCode == 200) {
        list.push(...res.data.list);
        res.data.list.length == 0 ? page : page += 1;
        this.setData({list:list,loadingshow: false,page: page})
      }
    }).catch(() => {})
  },
  inputChange(e) {
    this.setData({value: e.detail.value});
    if(e.detail.value == '') {
      this.setData({list: [],page: 1})
    }
  },
  clear() {
    this.setData({list: [],page: 1})
  }
})