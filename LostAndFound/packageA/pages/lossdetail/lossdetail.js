import api from "../../../api/api";
import { $Toast } from '../../../ui/iview-weapp/dist/base/index';
const db = wx.cloud.database();
Page({
  data: {
    lossInfo: {},
    UID: 0,
    isOwn: false,
    lossId: 0,
    sureShow: false, //确定弹出框 
    delShow: false,  //删除键弹出框
    takeShow: false, //揭取弹出框
    url: '',
    buttons: [{text: '取消'}, {text: '确定'}], //弹窗按钮
    dialogs: [
      {show: false,type: "fin",content:"是否完成告示？"},
      {show: false,type: "del",content:"是否删除告示？"},
      {show: false,type: "receive",content:"是否揭取告示？"}
    ]
  },
  async onLoad(e) {
    this.setData({lossId: e.id})
    await this.getLossInfo(e.id)
  },
  onReady() {
    
  },
  async getLossInfo(id) {
    const UID = JSON.parse(wx.getStorageSync('laf')).uid;
    await api.get("/api/loss/bulletin/detail",{id}).then(res => {
      wx.showLoading({
        title: '加载中',
      })
      let statusCode = res.data.status;
      if(statusCode == 200) {
        this.setData({lossInfo: res.data.lossInfo,UID});
        if(UID != res.data.lossInfo.uid) {
          this.setData({isOwn: true})
        }
      }
    }).catch(() => {});
    wx.hideLoading();
  },
  async toChat() {
    //当前用户uid
    const UID = this.data.UID;
    //发布告示的用户
    const bUID = this.data.lossInfo.uid; 
    const that = this;
    const _ = db.command;
    let roomID = '';
    await db.collection("record_list").where(
      _.and([
        {userAID: _.eq(UID).or(_.eq(bUID))},
        {userBID:_.eq(UID).or(_.eq(bUID))}
      ])
    ).get().then(res => {
      if(res.data.length <= 0) {
        // 数据库未有该两人的聊天室,证明两人没有联系过
        roomID = UID.toString() + bUID.toString();
        // 创建聊天室
        that.insertRoomID(roomID,UID,bUID);
        // 添加双方到双方聊天列表中
        that.insertChatList(UID,bUID,roomID);
        that.insertChatList(bUID,UID,roomID);
      } else {
        roomID = res.data[0].roomID;
      }
      wx.navigateTo({
        url: `/packageA/pages/chatpage/chatpage?roomID=${roomID}&receiveID=${bUID}`,
      });
    })
  },
  // 创建聊天室
  async insertRoomID(roomID,userAID,userBID) {
    const doc = {
      roomID: roomID,
      userAID: userAID,
      userBID: userBID,
      record: []
    };
    await db.collection("record_list").add({
      data: doc
    })
  },
  // 增添对话对象
  async insertChatList(admin,other,roomID) {
    const date = Date.now();
    await api.post("/api/add/chatlist",{
      admin_uid: admin,
      chat_uid: other,
      roomID,
      date
    }).then(res => {
      
    })
  },
  // 告示按钮
  openDialog(e) {
    let {type} = e.target.dataset;
    switch (type) {
      case "fin":
        this.setData({"dialogs[0].show": true,url: '/api/update/bulletin'})
        break;
      case "del":
        this.setData({"dialogs[1].show": true,url: '/api/del/bulletin'})
        break;
      case "receive":
        this.setData({"dialogs[2].show": true,url: '/api/take/bulletin'})
      default: break
    }
  },
  // 更新数据
  updateData(e) {
    let {index} = e.detail;
    let {type} = e.target.dataset;
    const that = this;
    if(index == 1) {
      api.post(that.data.url,{id: that.data.lossId,uid:that.data.UID}).then(res => {
        let statusCode = res.data.status;
        $Toast({
          content: res.data.msg
        });
        if(statusCode == 200) {
          type == 'receive' ? that.getLossInfo(that.data.lossId) : wx.navigateBack()
        }
      })
    };
    switch (type) {
      case "fin":
        this.setData({"dialogs[0].show": false})
        break;
      case "del":
        this.setData({"dialogs[1].show": false})
        break;
      case "receive":
        this.setData({"dialogs[2].show": false})
        break;
      default: break
    }
  } 
})