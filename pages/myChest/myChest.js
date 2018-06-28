const util = require('../../utils/util.js')
const app = getApp()
Page({
	/**
   	* 页面的初始数据
   	*/
	data:{
  	_num: '1',//顶部切换的状态变量
  	hold_state: false,//礼物状态（显示与否）
    hold_states: '等待对方接受',//礼物状态（持有中）
    send_state: '对方已接收',//礼物状态（已接收）
    haspick_state: '物流中',//礼物状态（已提货）
    list_1: false,
    list_2: true,
    list_3: true,
    list_4: true,

    hold_list: '',//持有中列表
    hold_page_num: 1,//持有中请求的页数

    send_list: '',//已送出列表
    send_page_num: 1,//已送出请求的页数
    
    hasWi_list: '',//已变现列表
    hasWi_page_num: 1,//已变现请求的页数
    
    haspick_list: '',//已提货列表
    haspick_page_num: 1,//已提货请求的页数
    holdEmpty:false,//持有中空
    sendEmpty:false,//已送出空
    haswiEmpty:false,//已提现空
    haspickEmpty:false, //已提货空
    hold:false,
    send:false,
    withdraw:false,
    pick:false
	},
	//页面顶部菜单切换
  	menuClick: function(e) {
      if(e.target.dataset.num==1){
        this.setData({
          list_1: false,
          list_2: true,
          list_3: true,
          list_4: true,
        })
      }else if(e.target.dataset.num==2){
        this.setData({
          list_1: true,
          list_2: false,
          list_3: true,
          list_4: true,
        })
      }else if(e.target.dataset.num==3){
        this.setData({
          list_1: true,
          list_2: true,
          list_3: false,
          list_4: true,
        })
      }else if(e.target.dataset.num==4){
        this.setData({
          list_1: true,
          list_2: true,
          list_3: true,
          list_4: false,
        })
      }
    	this.setData({
      		_num: e.target.dataset.num
    	})
  	},
    //礼物点击进入礼物详情
    seeGiftDetail: function(e) {
      wx.navigateTo({
        url: '../../pages/giftDetail/giftDetail?orderId='+e.currentTarget.dataset.num+'&giftStatus='+this.data._num
      })
    },
  	//再撩一次
  	sendAgain: function(){
      wx.reLaunch({
        url: '../../pages/index/index'
      })
  	},
    //查看留言
    leaveMessage: function(e) {
      var nickName=e.target.dataset.nickname;
      var imgUrl=e.target.dataset.imgurl;
      wx.navigateTo({
        url: '../../pages/leaveMessage/leaveMessage?orderId='+e.target.dataset.num+'&nickName='+nickName+'&imgUrl='+imgUrl
      })
    },
    //物流信息
    logistics: function(e) {
      wx.navigateTo({
        url: '../../pages/logistics/logistics?orderId='+e.target.dataset.num
      })
    },
    //确认收货
    confirms: function(e){
      var that = this
      wx.showModal({
        title: '提示',
        content: '你是否确认收货？',
        success: function(res) {
          if (res.confirm) {
            wx.request({
              url: util.API()+'/order/confirmReceipt?orderId='+e.target.dataset.num,
              method: 'POST',
              success: function(res){
                console.log('------确认收货-------')
                console.log(res)
                if(res.data.code==100){
                  wx.showToast({
                    title: '成功',
                    icon: 'success',
                    duration: 2000
                  })
                  that.requHasPickList();
                }
              }
            })
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }
      })
    },
    //请求(持有中)订单列表
    requHoldList: function(cb){
      var that = this
      this.setData({
        'hold_page_num':1
      })
      wx.request({
        url: util.API()+'/order/getMyGiftCards',
        method: 'GET',
        data: {
          userId: app.globalData.userId,
          types: 1,
          pageNum: 1,
          pageSize: 10,
        },
        success: function (res) {
          that.setData({
            hold:true
          })
          if(that.data.hold && that.data.send && that.data.withdraw && that.data.pick){
            wx.hideLoading()
          }
          console.log('----持有中列表-----')
          console.log(res)
          console.log(that.data.hold_list)
          if(!res.data.content.list){
            that.setData({
              'holdEmpty':true
            })
          }else{
           that.setData({
             hold_list: res.data.content.list,
             holdEmpty:false
           })
          }
          typeof cb == "function" && cb('1')
        }
      })
    },
    //请求(已送出)订单列表
    requSendList: function(cb){
      var that = this
      this.setData({
        'send_page_num':1
      })
      wx.request({
        url: util.API()+'/order/getMyGiftCards',
        method: 'GET',
        data: {
          userId: app.globalData.userId,
          types: 2,
          pageNum: 1,
          pageSize: 10,
        },
        success: function (res) {
          that.setData({
            send:true
          })
          if(that.data.hold && that.data.send && that.data.withdraw && that.data.pick){
            wx.hideLoading()
          }
          console.log('-------已送出订单列表--------')
          console.log(res)
          if(!res.data.content.list){
            that.setData({
              'sendEmpty':true
            })
          }else{
           that.setData({
            send_list: res.data.content.list,
            sendEmpty:false
           })
          }
          typeof cb == "function" && cb('1')
        }
      })
    },
    //请求(已提现)订单列表
    requWithList: function(cb){
      var that = this
      this.setData({
        'hasWi_page_num':1
      })
      wx.request({
        url: util.API()+'/order/getMyGiftCards',
        method: 'GET',
        data: {
          userId: app.globalData.userId,
          types: 3,
          pageNum: 1,
          pageSize: 10,
        },
        success: function (res) {
          that.setData({
            withdraw:true
          })
          if(that.data.hold && that.data.send && that.data.withdraw && that.data.pick){
            wx.hideLoading()
          }
          console.log('-------已提现列表--------')
          console.log(res)
          if(!res.data.content.list){
            that.setData({
              'haswiEmpty':true
            })
          }else{
            that.setData({
              hasWi_list: res.data.content.list,
              haswiEmpty:false
            })
          }
          typeof cb == "function" && cb('1')
        }
      })
    },
    //请求(已提货)订单列表
    requHasPickList: function(cb){
      var that = this
      this.setData({
        'haspick_page_num':1
      })
      wx.request({
        url: util.API()+'/order/getMyGiftCards',
        method: 'GET',
        data: {
          userId: app.globalData.userId,
          types: 4,
          pageNum: 1,
          pageSize: 10,
        },
        success: function (res) {
          that.setData({
            pick:true
          })
          if(that.data.hold && that.data.send && that.data.withdraw && that.data.pick){
            wx.hideLoading()
          }
          console.log(res)
          if(!res.data.content.list){
            that.setData({
              'haspickEmpty':true
            })
          }else{
            that.setData({
              haspick_list: res.data.content.list,
              haspickEmpty:false
           })
          }
          typeof cb == "function" && cb('1')
        }
      })
    },
    //
  	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
    wx.showLoading({
      'title': '加载中',
      'mask': true
    })
	  this.requHoldList('');//持有中的列表
    this.requSendList('');//已送出的列表
    this.requWithList('');//已变现的列表
    this.requHasPickList('');//已提货的列表
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
      if(wx.getStorageSync('chestRender')){
         wx.showLoading({
           'title': '加载中',
           'mask': true
         })
        this.setData({
          'hold_list':[],
          'send_list':[],
          'hasWi_list':[],
          'haspick_list':[],
          'holdEmpty':false,
          'sendEmpty':false,
          'haswiEmpty':false,
          'haspickEmpty':false,
          '_num': '1',
          'list_1': false,
          'list_2': true,
          'list_3': true,
          'list_4': true,
          'hold_page_num': 1,
          'send_page_num':1,
          'hasWi_page_num': 1,
          'haspick_page_num': 1,
          'hold':false,
          'send':false,
          'withdraw':false,
          'pick':false
        })
        this.requHoldList('');//持有中的列表
        this.requSendList('');//已送出的列表
        this.requWithList('');//已变现的列表
        this.requHasPickList('');//已提货的列表
      }
  	},

  	/**
   	* 生命周期函数--监听页面隐藏
   	*/
  	onHide: function () {
      wx.removeStorageSync('chestRender')
  	},

  	/**
   	* 生命周期函数--监听页面卸载
   	*/
  	onUnload: function () {
      wx.removeStorageSync('chestRender')
  	},

  	/**
   	* 页面相关事件处理函数--监听用户下拉动作
   	*/
  	onPullDownRefresh: function () {
      wx.showNavigationBarLoading() //在标题栏中显示加载
       var that=this;
       if(this.data._num==1){
          setTimeout(function(){
            that.requHoldList(function(res){
              if(res){
                 wx.hideNavigationBarLoading() //完成停止加载
                 wx.stopPullDownRefresh() //停止下拉刷新
              }
            });//持有中的列表
          },1000)
       }else if(this.data._num==2){
          setTimeout(function(){
              that.requSendList(function(res){
                if(res){
                  wx.hideNavigationBarLoading() //完成停止加载
                  wx.stopPullDownRefresh() //停止下拉刷新
                }
              });//已送出的列表
          },1000)
       }else if(this.data._num==3){
          setTimeout(function(){
            that.requWithList(function(res){
              if(res){
                 wx.hideNavigationBarLoading() //完成停止加载
                 wx.stopPullDownRefresh() //停止下拉刷新
              }
            });//已变现的列表
          },1000)
       }else{
          setTimeout(function(){
            that.requHasPickList(function(res){
              if(res){
                wx.hideNavigationBarLoading() //完成停止加载
                wx.stopPullDownRefresh() //停止下拉刷新
              }
            });//已提货的列表
          },1000)
       }
    },

    /**
    * 页面上拉触底事件的处理函数
    */
    onReachBottom: function () {
      var that=this;
      if(this.data._num==1){
        this.setData({
          'hold_page_num':this.data.hold_page_num+1  //持有中请求的页数
        })
        wx.request({
          url: util.API()+'/order/getMyGiftCards',
          method: 'GET',
          data: {
            userId: app.globalData.userId,
            types: 1,
            pageNum: that.data.hold_page_num,
            pageSize: 10,
          },
          success: function (res) {
            console.log(res)
            that.setData({
              hold_list: that.data.hold_list.concat(res.data.content.list)
            })
          }
        })
      }else if(this.data._num==2){
        this.setData({
          'send_page_num':this.data.send_page_num+1  //已送出请求的页数
        })
        wx.request({
          url: util.API()+'/order/getMyGiftCards',
          method: 'GET',
          data: {
            userId: app.globalData.userId,
            types: 2,
            pageNum: that.data.send_page_num,
            pageSize: 10,
          },
          success: function (res) {
            console.log(res)
            that.setData({
              send_list: that.data.send_list.concat(res.data.content.list)
            })
          }
        })
      }else if(this.data._num==3){
        this.setData({
          'hasWi_page_num':this.data.hasWi_page_num+1  //已变现请求的页数
        })
        wx.request({
          url: util.API()+'/order/getMyGiftCards',
          method: 'GET',
          data: {
            userId: app.globalData.userId,
            types: 3,
            pageNum: that.data.hasWi_page_num,
            pageSize: 10,
          },
          success: function (res) {
            console.log(res)
            that.setData({
              hasWi_list: that.data.hasWi_list.concat(res.data.content.list)
            })
          }
        })  
	    }else if(this.data._num==4){
        this.setData({
          'haspick_page_num':this.data.haspick_page_num+1  //已提货请求的页数
        })
        wx.request({
          url: util.API()+'/order/getMyGiftCards',
          method: 'GET',
          data: {
            userId: app.globalData.userId,
            types: 4,
            pageNum: that.data.haspick_page_num,
            pageSize: 10,
          },
          success: function (res) {
            console.log(res)
            that.setData({
              haspick_list: that.data.haspick_list.concat(res.data.content.list)
            })
          }
        })  
      }
    },


})		