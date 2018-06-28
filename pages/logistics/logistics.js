// pages/logistics/logistics.js
const util = require('../../utils/util.js')
//获取应用实例
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    expressDetail:null  //物流详情
  },
  path: '',//图片地址

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    wx.request({
      url: util.API()+'/express/getExpressDetail',
      method: 'POST',
      data:{
         'orderId': options.orderId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res){
         if(res.data.msg=='ok'){
            that.setData({
               'expressDetail':res.data.result,
               'path': res.data.path
            })
          }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})