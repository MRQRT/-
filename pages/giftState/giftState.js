//giftState.js
//获取应用实例
const util = require('../../utils/util.js')
const app = getApp()
Page({
    data: {
      'meIn': false,//我打开对话框进入页面
      'soIn': false,//他人点进去的对话框
      'getGift': false,//礼物收取弹框控制按钮
      'sendName': '',//发送者昵称
      'queryOpenId': '',//发送人的openId
      'requestOpenId': '',//请求当前用户的openId
      'orderId': '',//需要查询的orderid（上一个发送人传过来的orderId）
      'orderDetail':null, //我打开时的订单详情
      'userId': '', //发送礼品者userid
      'giveBack': false, //已退回
      'hasGetOther': false, //已被别人领取
      'percent': 0, //下载视频进度
      'proHidden': false, //视频进度条消失
      'tempPath': null, //下载到本地视频地址
      'acceptClick':[], //存放点击’领取‘按钮时间
      'hidden': true,//变现遮罩层
      'cashUse': true,
      'message':'' //留言
    },
  //点击弹框的关闭按钮
  closeWindow: function(){
    wx.navigateBack({
      delta: 0
    }) 
  },
  //点击我要送跳转商品列表页面
  meSend(){
    wx.navigateTo({
       url: '../index/index',
    })
  },
  //预览图片
  previewPic(e){
    var src=e.currentTarget.dataset.src;
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: [src] // 需要预览的图片http链接列表
      })
  },
/**
 *
 *
 *用于反解开EMOJI编码后的字符串
 *
 *
 * */
uncodeUtf16(str){
    var reg = /\&#.*?;/g;
    var result = str.replace(reg,function(char){
        var H,L,code;
        if(char.length == 9 ){
            code = parseInt(char.match(/[0-9]+/g));
            H = Math.floor((code-0x10000) / 0x400)+0xD800;
            L = (code - 0x10000) % 0x400 + 0xDC00;
            return unescape("%u"+H.toString(16)+"%u"+L.toString(16));
        }else{
            return char;
        }
    });
    return result;
},
  //点击收取礼物
  accept: function(){
    var that=this;
    var date=new Date().getTime();
    var arr=this.data.acceptClick.concat([date])
    this.setData({
      'acceptClick':arr
    })
    if(this.data.acceptClick[this.data.acceptClick.length-1]-this.data.acceptClick[this.data.acceptClick.length-2]<300){
      return;
    }
    //已经被别人领取提示
    if(this.data.hasGetOther){
      wx.showToast({
        title: '已被别人领取',
        image: '../../images/gantanhao.png',
        duration: 2000,
        mask:true
      })
      setTimeout(function(){
          that.setData({
            'acceptClick':[]
          })
      },2000)
    }else{
      var that=this;
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            //触发领取礼物接口
            that.endViewDetail()
          }else{
            wx.showModal({
              title: '提示',
              content: '您点击了拒绝授权,将无法正常获取个人信息,点击确定重新获取授权。',
              success: function (res) {
                if (res.confirm) {
                  wx.openSetting({
                    success: (res) => {
                      if (res.authSetting["scope.userInfo"]) {//如果用户重新同意了授权登录
                        wx.getUserInfo({
                          success: function (res_user) {
                            app.globalData.userInfo = res_user.userInfo
                            wx.setStorageSync('userInfo', res_user.userInfo)
                            wx.request({
                              url: util.API()+'/api/user/addUser',
                              method: 'GET',
                              data:{
                                'openId': app.globalData.openId,
                                'nickname': app.globalData.userInfo.nickName,
                                'avatar': app.globalData.userInfo.avatarUrl,
                                'source': app.globalData.source,
                              },
                              success: function(res){
                                app.globalData.userId = res.data.content.id
                              }
                            })
                          }
                        })
                      }
                    }
                  })
                }else{
                  wx.navigateBack({
                    delta:0
                  })
                }
              }
            })
          }
        },
        fail:res=>{

        }
      })
    }
  },
  //查看产品详情
  viewDetail(){
    wx.navigateTo({
      url: '../goodsDetail/goodsDetail?id='+this.data.orderDetail.productId,
    })
  },
  //触发领取礼物接口
  endViewDetail(){
    var that=this;
    wx.request({
      url: util.API()+'/order/receiveGift',
      method: 'POST',
      data:{
        'openId': that.data.requestOpenId,
        'orderId': that.data.orderId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if(res.data.code==100){
          //领取礼物成功后再查询礼物详情
          //拿到新的orderid查看详情
          wx.request({
            url: util.API()+'/order/queryOrderDetail',
            method: 'GET',
            data:{
              'orderId':that.data.orderId,
              'userId':app.globalData.userId
            },
            success: function (res) {
              if(res.data.code==100){
                that.setData({
                  'orderDetail':res.data.content,
                  'message':that.uncodeUtf16(res.data.content.message)
                })
                that.setData({
                  'getGift': false,
                  'soIn': true, //是对方点进来的
                })
                wx.setNavigationBarTitle({
                  title: '我收到的礼物'
                })
                if(res.data.content.videoUrl){
                  const downloadTask=wx.downloadFile({
                    url: res.data.content.videoUrl, 
                    success: function(res) {
                      if(res.errMsg=='downloadFile:ok'){
                        that.setData({
                         'tempPath':res.tempFilePath
                        })
                      }
                    },
                    fail:function(err){
                    }
                  })
                  downloadTask.onProgressUpdate((res) => {
                    that.setData({
                      'percent':res.progress
                    })
                    if(that.data.percent==100){
                      that.setData({
                        'proHidden':true
                      })
                    }
                  })
                }
              }
            }
          })
        }else if(res.data.code=='-3009'){
          wx.showToast({
            'title': '已被别人领取',
            'image':'../../images/gantanhao.png',
            'mask': true,
          })
        }
      },
      fail:function(){
        that.setData({
          'acceptClick':[]
        })
      }
    })
  },
  //请求openid判断用户状态
  testState: function (){
    var that  = this
    //请求用户openid并存储
    app.getOpenId(function (openId) {
      that.setData({
        requestOpenId: openId
      })
      //请求用户信息
      app.getUserInfo(function () {
        wx.hideLoading()//loading状态隐藏
        //查看订单状态
        wx.request({
          url: util.API()+'/order/queryOrderDetail',
          method: 'GET',
          data:{
            'orderId': that.data.orderId,
            'userId': app.globalData.userId
          },
          success: function (res) {
            console.log(res)
            console.log(app.globalData.userId)
            console.log(that.data.orderId)
            if(res.data.code==100){
              that.setData({
                'orderDetail':res.data.content,
                'message':that.uncodeUtf16(res.data.content.message)
              })
              if(that.data.queryOpenId == that.data.requestOpenId){ //根据传进来的openid判断是哪个人点进来的
                //领取礼卡的弹框出现
                that.setData({
                  'meIn': true, //是我点进来的
                }) 
                wx.setNavigationBarTitle({
                  title: '礼物'
                })
              }else{
                if(that.data.orderDetail.statusCode=='3'){//不同的人未领取
                  //弹框出现
                  that.setData({
                    'getGift': true
                  })
                }else if(that.data.orderDetail.statusCode=='4'){//已退回
                  that.setData({
                    'giveBack': true
                  })
                  wx.setNavigationBarTitle({
                    title: '礼物'
                  })
                }else{
                  that.setData({
                    'soIn': true, //是对方点进来的
                  })
                  wx.setNavigationBarTitle({
                    title: '我收到的礼物'
                  })
                  if(res.data.content.videoUrl){
                    const downloadTask=wx.downloadFile({
                      url: res.data.content.videoUrl, 
                      success: function(res) {
                        if(res.errMsg=='downloadFile:ok'){
                          that.setData({
                            'tempPath':res.tempFilePath
                          })
                        }
                      },
                      fail:function(err){
                      }
                    })
                    downloadTask.onProgressUpdate((res) => {
                      that.setData({
                        'percent':res.progress
                      })
                      if(that.data.percent==100){
                        that.setData({
                          'proHidden':true
                        })
                      }
                    })
                  }
                }
              }
            }else if(res.data.code=='-3009'){
              that.setData({
                'getGift': true,
                'hasGetOther': true,
              })
            }
          }
        })
      }, function() {
        that.setData({
          'getGift': true
        })
        wx.hideLoading()  //loading状态隐藏
      })
    })
  },
  //点击去我的礼品柜
  toMychest: function() {
    wx.navigateTo({
      url: '../myChest/myChest'
    })
  },
/*提现*/
  withd:function(){
    this.setData({
      hidden: false
    });
  },
  //确定卖出
  confirm: function(e){
    var that = this
    console.log(e)
    console.log(that.data.orderDetail.orderId)
    console.log(e.detail.formId)
    if(!this.data.cashUse) return;
    this.setData({
      'cashUse':false
    })
    wx.request({
      url: util.API()+'/order/giftToCash?orderId='+that.data.orderDetail.orderId+'&formId='+e.detail.formId,
      method: 'POST',
      success: function(res){
        console.log(res)
        var res = res
        that.setData({
          hidden: true
        })
        if(res.data.code==100){
          wx.showToast({
            title:'卖出成功',
          })
          setTimeout(function(){
            wx.navigateBack({
              delta: 1
            })
          },1800)
        }else{
          wx.showToast({
            title:res.data.message,
            image: '../../images/wrong.png'
          })
          that.setData({
            'cashUse':true
          })
        }
      },
      fail:function(){
        that.setData({
          'cashUse':true
        })
      }
    })
  },
  //点击取消
  cancel: function(){
    this.setData({
      hidden: true,
      cashUse:true
    })
  },
  onLoad: function (query) {
    wx.showLoading({
      'title': '加载中',
      'mask': true
    })
    var that = this;
    //设置发送人的个人信息
    that.setData({
      queryOpenId:query.openId,
      orderId: query.orderId,//页面传过来的orderId
      userId:query.userId,
      sendName:query.nickName
     })
    this.testState();
  },
  onReady: function (options) {
  
  },
  onShow: function (options) {
    this.testState()
    this.setData({
      'acceptClick':[],
      'cashUse':true
    })
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
