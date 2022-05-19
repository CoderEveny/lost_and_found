import api from "../../../api/api";
const db = wx.cloud.database();
Page({
  data: {
    tempmsg: '',
    ownInfo: {},   //本人信息
    otherInfo: {},  //他人信息
    roomID: '',
    // openId: '',
    chats: []   //聊天记录
  },
  async onLoad(e) {
    wx.showLoading({
      title: '加载中',
    })
    const UID = JSON.parse(wx.getStorageSync('laf')).uid;
    this.setData({roomID: e.roomID})
    // await this.getOpenID()
    await this.getUserInfo(parseInt(e.receiveID),"other")
    await this.getUserInfo(UID,"own");
    wx.hideLoading();
  },
  onReady() {
    const that = this;
    const _ = db.command;
    // 监听该聊天室数据库变化
    db.collection("record_list").where({
      roomID: _.eq(that.data.roomID)
    }).watch({
      onChange: this.infoChange.bind(this),
      onError(err) {
        console.log(err)
      }
    })
  },
  // 数据库发生变化
  infoChange(snapshot) {
    const that = this;
    // 监听开始时的初始化数据，第一次
    if(snapshot.type === 'init') {
      this.setData({
        chats: [
          ...that.data.chats,
          ...[...snapshot.docs[0].record]
          // ...[...snapshot.docs[0].record].sort((x,y) => x.sendTimeTS - y.sendTimeTS)
        ]
      })
    } else {
      const chats = [...that.data.chats]
      for(const docChange of snapshot.docChanges) {
        // queueType:列表更新类型，表示更新事件对监听列表的影响
        switch(docChange.queueType) {
          /**
           * init 初始化列表
           * enqueue 记录进入列表
           * dequeue 记录离开列表
           * update 列表中的记录内容由更新，但列表包含的记录不变
           * 但由于我这里变化的只是列表某条数据里的某个字段，所以这里用update匹配
           */
          case 'update':
            chats.push(docChange.doc.record[docChange.doc.record.length - 1]);
            break;
        }
      }
      that.setData({
        chats
        // chats: chats.sort((x,y) => x.sendTimeTS - y.sendTimeTS)
      })
    }
  },
  //同步输入框的信息
  bindKeyInput: function (e) {
    let value = e.detail.value
    this.setData({tempmsg: value})
  },
  // 发送信息记录至云数据库
  async onSendMsg() {
    const that = this;
    const _ = db.command
    if(!this.data.tempmsg) {
      return;
    }
    const doc = {
      uid: this.data.ownInfo.uid,
      msgText: 'text',
      textContent: this.data.tempmsg,
      sendTime: new Date(),
      sendTimeTS: Date.now()
    }
    await db.collection("record_list").where({
      roomID: _.eq(that.data.roomID)
    }).get().then(res => {
      let record = res.data[0].record;
      record.push(doc);
      // 更新聊天记录
      that.updateRecord(record);
      that.setData({tempmsg: ''});
    })
  },
  // 更新聊天记录
  async updateRecord(record) {
    const that = this;
    const _ = db.command;
    await db.collection("record_list").where({
      roomID: _.eq(that.data.roomID)
    }).update({
      data: {
        record
      }
    })
  },
  //获取用户信息
  async getUserInfo(id,type) {
    await api.get("/api/user/detail",{id}).then(res => {
      if(res.data.status == 200) {
        const info = res.data.userInfo;
        type == "own" ? this.setData({ownInfo: info}) : 	this.setData({otherInfo: info})
      }
    }).catch(() => {})
  },
  // 获取自身openid
  // async getOpenID() {
  //   await wx.cloud.callFunction({
  //     name: 'getOpenId',
  //   }).then((res) => {
  //     this.setData({
  //       openId: res.result.openid
  //     })
  //   }).catch((e) => {});
  // }
})