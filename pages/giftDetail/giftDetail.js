// pages/girtDetail/giftDetail.js
const util = require('../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    largePictures: '',
    productName: '',
    nick_name: '',
    fromAvatar: '',//发送人的头像
    leave_message: "",//留言
    video_images: 1,//0表示图片，1表示视频
    videoUrl: '',//留言带的视频地址
    imageUrl: '',//留言带的图片地址
    withdraw: '变现',
    pick: '提货',
    give: '转赠',
    sell: '1314',
    hidden: 'true',
    sellAmount: '',
    status: false,
    orderId: '',//订单Id
    productId: '',//产品Id
    giftStatus: '',//产品状态
    tempPath:null, //下载到本地视频地址
    percent:0, //下载视频进度
    proHidden:false, //视频进度条消失
    btnUse:true, //转赠按钮是否可点击
    cashUse:true //提现按钮怎么点击
  },
  //点击查看产品详情
  seeDetail:function(e){
    wx.navigateTo({
      url: '../../pages/goodsDetail/goodsDetail?id='+e.target.dataset.num,
    })
  },
  /*提现*/
  withd:function(){
    this.setData({
      hidden: false
    });
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
  //确定卖出
  confirm: function(e){
    var that = this
    if(!this.data.cashUse) return;
    this.setData({
      'cashUse':false
    })
    wx.request({
      url: util.API()+'/order/giftToCash?orderId='+that.data.orderId+'&formId='+e.detail.formId,
      method: 'POST',
      success: function(res){
        var res = res
        that.setData({
          hidden: true
        })
        if(res.data.code==100){
          wx.setStorageSync('chestRender',true)  //跳转回我的礼物柜需要重新刷新
          wx.navigateBack({
              delta: 1
          })
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
  /*提货*/
  give: function(){
    wx.navigateTo({
      url:'../../pages/giftHome/giftHome?orderId='+this.data.orderId
    })
  },
  //转赠
  sendToOne: function(){
    var that=this;
    if(!this.data.btnUse){
      return;
    }
    this.setData({
      'btnUse':false
    })
    wx.navigateTo({
      url: '../../pages/giveOther/giveOther?productId='+this.data.productId+'&orderId='+this.data.orderId,
      fail:function(){
        that.setData({
          'btnUse':true
        })
      }
    })
  },
  //再撩一次
  senAgain: function(e){
    var that = this
    wx.reLaunch({
      url:'../../pages/index/index',
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //获取产品Id和礼物的状态
    this.setData({
      orderId: options.orderId,//订单Id
      giftStatus: options.giftStatus//礼物状态 1、持有中 2、已送出 3、已变现 4、已提货
    })
    wx.request({
      url: util.API()+'/order/queryOrderDetail?orderId='+that.data.orderId+'&userId='+app.globalData.userId,
      method: 'get',
      success: function(res){
        var giftImageUrl = '';
        for(var i=0;i<res.data.content.middlePictures.length;i++){
          if(res.data.content.middlePictures[i].sortNo == 3){
            giftImageUrl = res.data.content.middlePictures[i].path
          }
        }
        that.setData({
          nick_name: res.data.content.fromNickName,
          fromAvatar: res.data.content.fromAvatar,
          leave_message: that.uncodeUtf16(res.data.content.message),
          productId: res.data.content.productId,
          productName: res.data.content.productName,
          imageUrl: res.data.content.imageUrl,
          videoUrl: res.data.content.videoUrl,
          largePictures: giftImageUrl,
          sellAmount: '￥'+res.data.content.sellAmount
        })
        if(res.data.content.videoUrl){
          const downloadTask=wx.downloadFile({
            url: res.data.content.videoUrl, //仅为示例，并非真实的资源
            success: function(res) {
              if(res.errMsg=='downloadFile:ok'){
                that.setData({
                  'tempPath':res.tempFilePath
                })
              }
            },
            fail:function(err){
              console.error(err)
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
            // console.log('下载进度', res.progress)
            // console.log('已经下载的数据长度', res.totalBytesWritten)
            // console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
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
     this.setData({
      'btnUse':true,
      'cashUse':true
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
