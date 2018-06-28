const util = require('../../utils/util.js')
//intro.js
//获取应用实例
const app = getApp()

Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    circular:true,
    interval: 5000,
    duration: 1000,
    goodsDetail:{
      'name':'龙睛金鱼',
      'material':'足金',
      'totalWeight':'1.53',
      'fineness':'999‰',
      'fitPer':'送爱人',
      'fitTime': '情人节、七夕、圣诞节、纪念日、生日',
      'size':'../../images/size.png'
    },
    goodId: '',
    largeImgUrl: '',//商品详情图片数组
    guiges: '',//规格图片地址
    wenans: '',//文案图片地址
  },
  changeIndicatorDots: function (e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function (e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function (e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function (e) {
    this.setData({
      duration: e.detail.value
    })
  },
  onLoad: function (options) {
    var that = this
    this.setData({
      goodId: options.id
    })
    wx.request({
      url:util.API()+"/api/product/queryGoodsDetail?id="+that.data.goodId,
      method:'get',
      success: function(res){
        var swiperList = [], wenan, guige;
        var imgArr = res.data.content.largePictures;
        for(var i=0;i<imgArr.length;i++){
          if(imgArr[i].sortNo==1){
            swiperList.push(imgArr[i].path)
          }else if(imgArr[i].sortNo==2){
            wenan = imgArr[i].path
          }else if(imgArr[i].sortNo==3){
            guige = imgArr[i].path
          }
        }
        that.setData({
          good: res.data.content,
          largeImgUrl: swiperList,
          guiges: guige,
          wenans: wenan
        })
      }
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
