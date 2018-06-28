const util = require('../../utils/util.js')
// pages/leaveMessage/leaveMessage.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nick_name:'',
    leave_message: '',
    imageUrl: '',
    videoUrl: '',
    largePictures: '',
    tempPath:null, //下载到本地视频地址
    percent:0, //下载视频进度
    proHidden:false //视频进度条消失
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //获取产品Id和礼物的状态
    this.setData({
      orderId: options.orderId,//产品Id
    })
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
          nick_name: res.data.content.fromNickName,
          leave_message: that.uncodeUtf16(res.data.content.message),
          imageUrl: res.data.content.imageUrl,
          videoUrl: res.data.content.videoUrl,
          largePictures: giftImageUrl
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