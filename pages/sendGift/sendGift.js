//addAddress.js
const util = require('../../utils/util.js')

//获取应用实例
const app = getApp()
Page({
  data: {
     'giftInfo':null  //从购买页面拿到转发礼品信息
  },
  //点击送给心上人实现转发功能
  onShareAppMessage(){
    var that=this;
    var leaveWords=that.data.giftInfo.title.slice(0,10) || ''
    if(that.data.giftInfo.title.length>10){  //留言超过10个字符时，加省略号
      leaveWords=leaveWords+'...'
    }
    return {
      'title': leaveWords, //留言只截取一行
      'imageUrl': that.data.giftInfo.src,//转发时的图片
      'path': '/pages/giftState/giftState?openId='+app.globalData.openId+'&orderId='+that.data.giftInfo.orderId+'&userId='+that.data.giftInfo.userId+'&nickName='+app.globalData.userInfo.nickName,//转发后希望用户跳转的页面
      'success':function(res){
        wx.removeStorageSync('liuyan')
        if(res.errMsg=='shareAppMessage:ok'){
          //发送礼卡
          wx.request({
            url: util.API()+'/order/sendGift',
            method: 'POST',
            data:{
              'orderId':that.data.giftInfo.orderId,
              'userId':that.data.giftInfo.userId,
              'content':that.data.giftInfo.title,
              'imageUrl':that.data.giftInfo.imageUrl,
              'videoUrl':that.data.giftInfo.videoUrl
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log(res)
              wx.reLaunch({
                url:'../../pages/index/index'
              })
            }
          })
        }
      },
      'fail':function(err){
        wx.removeStorageSync('liuyan')
      }
    }
  },
  onLoad: function (query) {
    var obj={};
    obj.orderId=query.orderId;
    // obj.title=query.content; //留言前十个字符
    obj.title=wx.getStorageSync('liuyan') || ''
    obj.src=query.src; //转发好友所带图片
    obj.userId=query.userId; //发送者的userid
    obj.imageUrl=query.imageUrl;//发送者上传的图片
    obj.videoUrl=query.videoUrl;//发送者上传的视频
    this.setData({
       'giftInfo':obj
    })
  },
  onReady: function () {
    
  },
  onShow: function () {
    
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  }
})		