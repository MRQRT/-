const util = require('../../utils/util.js')
//index.js
//获取应用实例
var app = getApp()
var n=0

Page({
  data: {
    userInfo: {},
    interval: 5000,
    duration: 250,
    autoplay: false,
    title: "爱我，就告诉我",
    // _num: 0,
    list: [],
    pixelRatio:null,  //高度比
    imageWidth:null, //图片宽度
    imageHeight:null, //图片高度
    btnBottom:null,  //按钮定位
    clickTime:[],  //存放点击‘我要告白’时间
    clickBoxTime:[], //存放点击’我的礼物柜‘时间
    // isIphoneX:false, //设备是否为iphone10
    marginTops:'',
  },
  //点击了解爱有金
  learnAbout: function () {
    wx.navigateTo({
      url: '../intro/intro',
    })
  },
  //点击我要告白
  sendGift: function (e) {
    //避免狂点时报错
    var date=new Date().getTime();
    var arr=this.data.clickTime.concat([date])
    this.setData({
      'clickTime':arr
    })
    if(this.data.clickTime[this.data.clickTime.length-1]-this.data.clickTime[this.data.clickTime.length-2]<300){
      return;
    }
    wx.navigateTo({
      url: '../buy/buy?id='+e.target.id
    })
  },
  //点击我的礼物柜
  to_myChest: function () {
    var date=new Date().getTime();
    var arr=this.data.clickBoxTime.concat([date])
    this.setData({
      'clickBoxTime':arr
    })
    if(this.data.clickBoxTime[this.data.clickBoxTime.length-1]-this.data.clickBoxTime[this.data.clickBoxTime.length-2]<300){
      return;
    }
    var that = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.navigateTo({
            url: '../myChest/myChest'
          })
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
                          app.globalData.userInfo = res_user.userInfo;
                          that.setData({
                            'userInfo': res_user.userInfo
                          })
                          wx.setStorageSync('userInfo', res_user.userInfo);
                          //如果允许授权，则向后台保存用户信息
                          wx.request({
                            url: util.API()+'/api/user/addUser',
                            method: 'GET',
                            data:{
                              'openId': app.globalData.openId,
                              'nickname': res_user.userInfo.nickName,
                              'avatar': res_user.userInfo.avatarUrl,
                              'source': app.globalData.source,
                            },
                            success: function(res){
                              // console.log(res)
                              app.globalData.userId = res.data.content.id
                            }
                          })
                        }
                      })
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
  },
  /*监听swiper滑动*/
  changeEvent: function(e){
    
  },
  onLoad: function (options) {
    // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    var scene = decodeURIComponent(options.scene)
    if(scene!='undefined'){
      app.globalData.source = scene
    }
    // console.log(app.globalData.source)
    var source = options
    // console.log(source)
    //wx.clearStorageSync() //测试时可以用此代码删掉手机小程序缓存
    var that=this;
    //请求产品列表
    wx.request({
      url: util.API()+"/api/product/queryPageGoods?pageNum=1&pageSize=10",
      method: 'GET',
      success: function (res) {
        that.setData({
          list: res.data.content.list
        })
      },
      fail:function(res){
      }
    })
    //请求用户openid并存储
    app.getOpenId(function (openId) {
      //请求用户信息
      app.getUserInfo(function (userinfo) { //如果打开应用拒绝授权则该代码不会执行
        that.setData({
          'userInfo': userinfo
        })
      })
    })
    //请求手机系统消息
    wx.getSystemInfo({
      success: function(res) {
        // console.log(res)
        // if(res.model.indexOf('iPhone X')!=-1){
        //   that.setData({
        //     'isIphoneX':true
        //   })
        // }
        // var ratio=(res.windowHeight/603)>1?1:(res.windowHeight/603);
        var ratio=(res.windowHeight/603);
        var widthRate = ratio>1?1:ratio;
        that.setData({
          pixelRatio:ratio,
          imageWidth:620*widthRate,
          imageHeight:860*ratio,
          btnBottom:60*ratio
        })
        var marginTop=(res.windowHeight-(that.data.imageHeight+40+50+48+30+25+22)*(res.windowWidth/750))/2/(res.windowWidth/750)
        that.setData({
          marginTops: marginTop
        })
      }
    })
  },
    /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function (options) {
   },
    /**
    * 生命周期函数--监听页面显示
    */
    onShow: function () {
     this.setData({
      'clickBoxTime':[],
      'clickTime':[]
     })
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


