//app.js
const util = require('./utils/util.js')
App({
  globalData: {
    openId: '',
    userInfo: '',
    userId: '',//我们后台保存的用户userId
    source: 'nosource',//来源
  },
  onLaunch: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res.SDKVersion)
      }
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if(res.code){
          wx.request({
            url: util.API()+'/getOpenId?jsCode='+res.code,
            method: 'GET',
            success: function (res) {
              that.globalData.openId = res.data.openid
              wx.setStorageSync('openId', res.data.openid)
            },
            fail: function (res) {
              // console.log(res);
            }
          })
        }else{
          // console.log('获取用户登录态失败！' + res.errMsg)
        }   
      }
    })
  },
  //解决异步问题(请求用户信息)
  getUserInfo: function (cb, cb2) {
    var that = this
    if(this.globalData.userId){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      wx.getUserInfo({
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          wx.setStorageSync('userInfo', res.userInfo)
          //如果允许授权，则向后台保存用户信息
          wx.request({
            url: util.API()+'/api/user/addUser',
            method: 'GET',
            data:{
              'openId': that.globalData.openId,
              'nickname': that.globalData.userInfo.nickName,
              'avatar': that.globalData.userInfo.avatarUrl,
              'source': that.globalData.source,
            },
            success: function(res){
              console.log(res)
              that.globalData.userId = res.data.content.id
              wx.setStorageSync('userId', res.data.content.id)
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        },
        fail:function(){
          typeof cb2 == "function" && cb2()
        }
      })
    }
  },
  //解决异步问题(请求openid)
  getOpenId: function (cb) {
    var that = this
    if (this.globalData.openId) {
      typeof cb == "function" && cb(this.globalData.openId)
    } else {
      wx.login({
        success:function(res){
          if(res.code){
            wx.request({
              url: util.API()+'/getOpenId?jsCode=' + res.code,
              method: 'GET',
              success: function (res) {
                that.globalData.openId = res.data.openid
                typeof cb == "function" && cb(that.globalData.openId)
                wx.setStorageSync('openId', res.data.openid)
              },
            })
          }
        }
      })
    }
  },
  //存储用户信息
  storUserInfor: function(res){
    wx.setStorageSync('userInfo', res.userInfo)
  },
  onShow: function () {
  },
  onHide: function () {
  },
})