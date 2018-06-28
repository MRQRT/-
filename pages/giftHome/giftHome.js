//intro.js
//获取应用实例
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    'largePictures':'',
    'productName':'',
    'noAddress':false, //没有地址
    'address':null,
    'canRender':false,
    'orderId':'',
  },
  //跳转添加地址
  gotoAddAddress(){
    wx.navigateTo({
        url: '../addAddress/addAddress',
    })
  },
  //跳转我的地址
  gotoAddress(){
    wx.navigateTo({
      url: '../address/address',
    })
  },
  //确认提货
  confirmGet: function(){
    if(!this.data.address){
      wx.showToast({
        'title': '无地址',
        'image':'../../images/gantanhao.png',
        'mask': true,
      })
      return;
    }
    var that = this
    if(this.data.address && this.data.address.id){
      wx.request({
        url: util.API()+'/order/takeDelivery?orderId='+that.data.orderId+'&address='+that.data.address.id,
        method: 'POST',
        success: function(res){
          var res = res
          if(res.data.code==100){
            wx.setStorageSync('chestRender',true) //跳转回我的礼物柜需要重新刷新
            wx.navigateBack({
              delta: 2
            })
          }else{
            wx.showToast({
              title: res.data.message,
              image: '../../images/wrong.png'
            })
          }
        }
      })
    }
  },
  onLoad: function (options) {
    var that = this
    this.setData({
      orderId: options.orderId
    })
    //查询礼物详情
    wx.request({
      url: util.API()+'/order/queryOrderDetail?orderId='+that.data.orderId+'&userId='+app.globalData.userId,
      method: 'get',
      success: function(res){
        var giftImageUrl = '';
        for(var i=0;i<res.data.content.middlePictures.length;i++){
          if(res.data.content.middlePictures[i].sortNo == 2){
            giftImageUrl = res.data.content.middlePictures[i].path
          }
        }
        that.setData({
          productId: res.data.content.productId,
          productName: res.data.content.productName,
          largePictures: giftImageUrl,
        })
      }
    })
    //加载页面请求地址
    var that=this;
    wx.request({
      url: util.API()+'/member/queryAddress?userId='+app.globalData.userId,
      method:'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if(res.data.code==100){
          if (res.data.content.length){
            that.setData({//地址不为空则显示地址界面
              'noAddress':false,
            })
            var addresses = res.data.content;
            for (var i = 0; i < addresses.length;i++){
              if (addresses[i].isDefault){ //显示默认地址
                that.setData({
                  'address': addresses[i],
                  'canRender':true
                })
                break;
              }
            }
          }else{
            that.setData({
              'noAddress': true,
              'canRender':false
            })
          }
        }
      }
    })
  },
  onReady: function () {
  },
  onShow: function () {
    var that=this;
    //切换回页面时需要重新请求数据渲染
    var thisAddress=wx.getStorageSync('selectAddress');
    if(thisAddress){
        that.setData({
            'address': thisAddress,
            'canRender':true
        })
        return;
    }
    if(wx.getStorageSync('needAgain')){
       wx.request({
         url: util.API()+'/member/queryAddress?userId='+app.globalData.userId,
         method:'GET',
         header: {
            'content-type': 'application/json' // 默认值
         },
        success: function (res) {
            if(res.data.code==100){
               if (res.data.content.length){
                    that.setData({//地址不为空则显示地址界面
                       'noAddress':false,
                    })
                    var addresses = res.data.content;
                    for (var i = 0; i < addresses.length;i++){
                       if (addresses[i].isDefault){ //显示默认地址
                          that.setData({
                            'address': addresses[i],
                            'canRender':true
                          })
                       }
                    }
                }else{
                  that.setData({
                    'noAddress': true,
                    'canRender':false
                  })
                }
              }
            }
          })
    }

  },
  onHide: function () {

  },
  onUnload: function () {
     wx.removeStorageSync('selectAddress')
     wx.removeStorageSync('forward')
     wx.removeStorageSync('needAgain')
  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  }
})		