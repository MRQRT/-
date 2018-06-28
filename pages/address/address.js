//address.js
//获取应用实例
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
     address:[
     ],   //接口请求保存地址数组
     'pageCanRender':false,  //地址接口拿到数据后再渲染页面
     'selected':'../../images/selected.png',  //选中默认图标
     'noSelected': '../../images/noSelected.png',  //不选默认图标
  },
  //设置默认地址
  makeDefault(e){
      var target = e.target;
      //获取点击地址的索引值
      var index = target.dataset.text;
      //点击项如果是选中状态(即已经是默认地址)，则不改变状态
      if (this.data.address[index].isDefault){
          return;
      }
      //更改地址状态,选中的是选中图片,并调用接口设默认
      for(var i=0;i<this.data.address.length;i++){
        if(i==index){
          this.data.address[i].isDefault=1;
          var that=this;
          //设置默认地址
          wx.request({
            url: util.API()+'/member/putDefault',
            method: 'POST',
            data:{
              'userId':app.globalData.userId,
              'id': that.data.address[i].id
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              wx.setStorageSync('needAgain', true) //该字段决定返回到礼物到家时重新渲染
            }
          })
        }else{
          this.data.address[i].isDefault = 0;
        }
      }
      //视图层改变
      this.setData({
        'address': this.data.address
      })
  },
  //删除某个地址
  deleteThis(e){
    var target = e.target;
    var that=this;
    //获取点击地址的索引值
    var index = target.dataset.index;
    //删除地址
    wx.request({
        url: util.API()+'/member/delAddress/' + that.data.address[index].id,
        method: 'POST',
        data: {
          'userId': app.globalData.userId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
            wx.setStorageSync('needAgain', true) //改变量决定返回到礼物到家需不需要重新请求数据
            var storeThis=wx.getStorageSync('selectAddress');
            if(that.data.address[index].id == storeThis.id){
               wx.removeStorageSync('selectAddress')
            }
            //删除的地址是个默认地址
            if (that.data.address[index].isDefault) {
                that.data.address.splice(index, 1);
                //删除后设置第一个为默认
                if(that.data.address[0]){
                   that.data.address[0].isDefault = 1;
                   //设置默认地址
                   wx.request({
                     url: util.API()+'/member/putDefault',
                     method: 'POST',
                     data: {
                      'userId': app.globalData.userId,
                      'id': that.data.address[0].id
                     },
                     header: {
                      'content-type': 'application/x-www-form-urlencoded'
                     },
                     success: function (res) {
                     }
                   })
                }
               
                that.setData({
                   'address': that.data.address  //重新渲染视图层
                })
              
            }else{ //删除的不是默认地址直接更改data的数据渲染视图层
              that.data.address.splice(index, 1);
              that.setData({
                'address': that.data.address
              })
            }
          }
        })
  },
  //编辑某个地址
  editThis(e){
    var target = e.target;
    //获取点击地址的索引值
    var index = target.dataset.index;
    var willingEdit = this.data.address[index];
    wx.navigateTo({
      url: '../addAddress/addAddress?editObj=' + JSON.stringify(willingEdit)
    })
  },
  //点击新建地址跳转页面
  addAddress(e){
    if(this.data.pageCanRender){  //记录是否有地址，没有地址时添加地址时就把添加的地址设为默认
      var bool='是'
    }else{
      var bool='否'
    }
    wx.navigateTo({
      url: '../addAddress/addAddress?hasOldAddress='+bool,
    })
  },
  //选择收货地址(没有点击设默认)
  selectThis(e){
      var index=e.currentTarget.dataset.select;
      wx.setStorageSync('selectAddress', this.data.address[index])
      setTimeout(function(){
       wx.navigateBack({
          delta: 1  //跳转提货到家
        })
      })
  },
  onLoad: function (options) {  //页面加载请求地址
    var that = this;
    wx.request({
      url: util.API()+'/member/queryAddress?userId='+app.globalData.userId,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 100) {
          if (res.data.content.length) {
            var addresses = res.data.content;
            that.setData({
              'address': addresses,
              'pageCanRender':true
            })
          } else {
            //没有地址记录
          }
        }
      }
    })
  },
  onReady: function () {
  },
  onShow: function () {
      if(wx.getStorageSync('forward')=='address'){ //上一级页面是添加地址，则需要重新渲染页面
            var that = this;
            wx.request({
            url: util.API()+'/member/queryAddress?userId='+app.globalData.userId,
            method: 'GET',
            header: {
               'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                if (res.data.code == 100) {
                  if (res.data.content.length) {
                     var addresses = res.data.content;
                     that.setData({
                       'address': addresses,
                       'pageCanRender':true
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
  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  }
})		