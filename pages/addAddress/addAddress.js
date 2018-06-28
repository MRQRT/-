//addAddress.js
const util = require('../../utils/util.js')
//获取应用实例
const app = getApp()

Page({
  data: {
    'userName':'',//编辑地址时需要
    'num': '',//编辑地址时需要
    'address': '',//编辑地址时需要
    'edit':false, //是编辑还是添加
    'id':null, //要修改地址的id
    'needMakeDefault':false, //是否需要把添加的地址设为默认
    'hasFill':false //是否已填完信息
  },
  //监听收件人框输入
  bindNameInput(e){
    this.setData({
      'userName': e.detail.value
    })
    if(this.data.userName!='' && this.data.num!='' && this.data.address!=''){
      this.setData({
        'hasFill':true
      })
    }else{
      this.setData({
        'hasFill':false
      })
    }
  },
  //监听手机号框输入
  bindPhoneInput(e) {
    this.setData({
      'num': e.detail.value
    })
    if(this.data.userName!='' && this.data.num!='' && this.data.address!=''){
      this.setData({
        'hasFill':true
      })
    }else{
      this.setData({
        'hasFill':false
      })
    }
  },
  //监听详细地址框输入
  bindAddressInput(e) {
    this.setData({
      'address': e.detail.value
    })
    if(this.data.userName!='' && this.data.num!='' && this.data.address!=''){
      this.setData({
        'hasFill':true
      })
    }else{
      this.setData({
        'hasFill':false
      })
    }
  },
  //保存添加地址
  saveAddress(){
    var regExp = /1[3-9]\d{9}/;
    var num = this.data.num;
    var contact = this.data.userName;
    var address = this.data.address;
    if (this.data.userName == ''){
      wx.showToast({
        'title': '收件人不能为空',
        'image':'../../images/gantanhao.png',
        'mask': true,
      })
      return;
    }
    if (this.data.address == '') {
      wx.showToast({
        'title': '地址不能为空',
        'image':'../../images/gantanhao.png',
        'mask': true
      })
      return;
    }
    if (!regExp.test(num)) {
      wx.showToast({
        'title': '手机格式不正确',
        'image':'../../images/gantanhao.png',
        'mask': true
      })
      return;
    }
    if(this.data.edit){
      this.update(app.globalData.userId, this.data.id, contact, num, address)
    }else{
      this.add(app.globalData.userId, contact, num, address)
    }
  },
  add(userId, contact, telephone, address){ //添加地址
    var that=this;
    wx.request({
      url: util.API()+'/member/addAddress',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data:{
        'userId': userId,
        'contact': contact,
        'telephone': telephone,
        'address': address
      },
      success: function (res) {
          wx.setStorageSync('needAgain', true) //改变量决定返回到礼物到家需不需要重新请求数据
          if(that.data.needMakeDefault){
          //设置默认地址
          wx.request({
            url: util.API()+'/member/putDefault',
            method: 'POST',
            data: {
              'userId': userId,
              'id': res.data.content
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              var pageArr=getCurrentPages();
              if(pageArr[pageArr.length-2].route=='pages/address/address'){
                 wx.setStorageSync('forward', 'address')
              }
              wx.navigateBack({  //back页面可能是礼物到家 也可能是我的地址
                 delta: 1
              })
            }
          })
        }else{
            var pageArr=getCurrentPages();
            if(pageArr[pageArr.length-2].route=='pages/address/address'){
              wx.setStorageSync('forward', 'address')
            }
            wx.navigateBack({  //back页面可能是礼物到家 也可能是我的地址
              delta: 1
            })
        }
      }
    })
  },
  update(userId,id,contact, telephone, address) { //修改地址
    wx.request({
      url: util.API()+'/member/putAddress',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        'userId': userId,
        'id':id,
        'contact': contact,
        'telephone': telephone,
        'address': address
      },
      success: function (res) {
        wx.setStorageSync('needAgain', true) //改变量决定返回到礼物到家需不需要重新请求数据
        var pageArr=getCurrentPages();
        if(pageArr[pageArr.length-2].route=='pages/address/address'){
            wx.setStorageSync('forward', 'address')
        }
        wx.navigateBack({
          delta: 1  //只会是我的地址
        })
      }
    })
  },
  onLoad: function (query) {
    if (query.editObj){ //是否是编辑地址
        //编辑地址时带上要编辑的对象
        var editObj = JSON.parse(query.editObj);
        this.setData({
          'userName': editObj.contact,
          'num': editObj.telephone,
          'address': editObj.address,
          'id': editObj.id,
          'edit':true,
          'needMakeDefault':false,
          'hasFill':true
        })
        
        return;
    }
    if (query.hasOldAddress=='否') { //是否是第一次添加地址，是的话需要设为默认
       this.setData({
          'needMakeDefault':true,
          'edit':false
       })
       return;
    }
    var arr=getCurrentPages();
    if(arr[arr.length-2].route=='pages/giftHome/giftHome'){
        this.setData({
           'needMakeDefault':true,
           'edit':false
        })
    }
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