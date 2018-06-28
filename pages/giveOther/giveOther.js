const util = require('../../utils/util.js')
//detail.js
//获取应用实例
const app = getApp()
Page({
  data: {
    price: '',
    liuyan: '',
    video_src: '',//视频地址
    img_src: '',//图片地址
    hidden: true,//视频隐藏
    hidden2: true,//图片隐藏
    hidden3: false,//选取框隐藏
    productId: '',//产品Id
    orderId: '',//订单Id
    good:'',//产品的详细参数
    imgUrl: '',//产品图片地址
    imgUrl2: '',//产品图片没有文案
    orderId:'',//预支付下单订单号
    wordsId:'', //留言模板id
    alreadyUploadImageUrl: '',//图片上传成功后的地址
    alreadyUploadVideoUrl: '',//视频上传成功后的地址
    wordLength:0, //留言长度
    maxLenth:50, //留言最大长度
    percent:0, //下载进度
    proHidden:false, //进度条消失
    btnSend:true //是否可转赠
  },
  //视频和图片选择的模态框
  modal: function () {
    var that = this;
     this.setData({
      'percent':0,
      'proHidden':false
    })
    wx.showActionSheet({
      itemList: ['图片', '视频'],
      success: function (res) {
        if (res.tapIndex == 0) {
          //图片选择
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (choose_img_res) {
              // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
              if(choose_img_res.tempFiles[0].size>5242880){
                wx.showToast({
                  'title': '限5M以内',
                  'image':'../../images/wrong.png',
                  'mask': true,
                })
                return;
              }
              var tempFilePaths = choose_img_res.tempFilePaths[0]
              that.setData({
                img_src: tempFilePaths,
                hidden2: false,
                hidden3: true
              })
              that.uploadImage(function(val){})//图片上传
            }
          })
        } else {
          //视频选择
          wx.chooseVideo({
            sourceType: ['album', 'camera'],
            camera: 'back',
            success: function (choose_video_res) {
              if(choose_video_res.size>5242880){
                wx.showToast({
                  'title': '限5M以内',
                  'image':'../../images/wrong.png',
                  'mask': true,
                })
                return;
              }
              that.setData({
                video_src: choose_video_res.tempFilePath,
                hidden: false,
                hidden3: true
              })
              that.uploadVideo(function(val){})//视频上传
            }
          })
        }
      },
    })
  },
  //删除视频
  deleVideo: function() {
    this.setData({
      video_src: '',
      alreadyUploadVideoUrl: '',//视频上传成功后的地址
      hidden: true,
      hidden3: false
    })
  },
  //删除图片
  deleImage: function() {
    this.setData({
      alreadyUploadImageUrl: '',//图片上传成功后的地址
      img_src: '',
      hidden2: true,
      hidden3: false
    })
  },
  //查看产品详情
  goodsDetail: function () {
    wx.navigateTo({
      url: "../goodsDetail/goodsDetail?id="+this.data.productId
    })
  },
  //留言框输入
  bindLeaveWordsInput(e){
    this.setData({
      'liuyan': e.detail.value,
      'wordsId':'', //输入留言后即不适用模板留言
      'wordLength':e.detail.value.length
    })
  },
/** 
 * 用于把用utf16编码的字符转换成实体字符，以供后台存储 
 * @param  {string} str 将要转换的字符串，其中含有utf16字符将被自动检出 
 * @return {string}     转换后的字符串，utf16字符将被转换成&#xxxx;形式的实体字符 
 */  
utf16toEntities(str) {  
    var patt=/[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则  
    str = str.replace(patt, function(char){  
            var H, L, code;  
            if (char.length===2) {  
                H = char.charCodeAt(0); // 取出高位  
                L = char.charCodeAt(1); // 取出低位  
                code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法  
                return "&#" + code + ";";  
            } else {  
                return char;  
            }  
        });  
    return str;  
},
  //请求留言
  getLeaveWords(id){
    var that=this;
    var id=id || '';
    wx.request({
      url:util.API()+"/api/message/queryProductMessage?id="+id,
      method:'GET',
      success: function(res){
        if(res.data.code==100){
          var liuyan=res.data.content.content.slice(0,50)
          that.setData({
            'wordsId':res.data.content.id,
            'liuyan':liuyan
          })
          that.setData({
            'wordLength':that.data.liuyan.length
          })
        }
      }
    })
  },
  //随机选择留言
  randomCheck(){
    this.getLeaveWords(this.data.wordsId)
  },
  //图片上传
  uploadImage: function(cb,cb1){
    var that = this
    if (that.data.alreadyUploadImageUrl) {
      typeof cb == "function" && cb(that.data.alreadyUploadImageUrl)
    }else{
      //上传图片到服务器
      const uploadTask=wx.uploadFile({
        url: util.API()+'/upload/uploadFile',
        filePath: that.data.img_src,
        name: 'file',
        success: function(res){
          that.setData({
            alreadyUploadImageUrl: JSON.parse(res.data).content
          })
          typeof cb == "function" && cb(JSON.parse(res.data).content)
        },
        fail:function(){
          typeof cb1 == "function" && cb1() //上传失败释放转赠按钮
        }
      })

      uploadTask.onProgressUpdate((res) => {
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
  },
  //视频上传
  uploadVideo: function(cb,cb1){
    var that = this
    if (that.data.alreadyUploadVideoUrl) {
      typeof cb == "function" && cb(that.data.alreadyUploadVideoUrl)
    }else{
      //上传视频到服务器
      const uploadTask=wx.uploadFile({
        url: util.API()+'/upload/uploadFile',
        filePath: that.data.video_src,
        name: 'file',
        success: function(res){
          that.setData({
            alreadyUploadVideoUrl: JSON.parse(res.data).content
          })
          typeof cb == "function" && cb(JSON.parse(res.data).content)
        },
        fail:function(){
          typeof cb1 == "function" && cb1() //上传失败释放转赠按钮
        }
      })
      uploadTask.onProgressUpdate((res) => {
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
  },
  //转赠页面跳转
  submitSendToSomeOrder: function () {
    var liu=this.utf16toEntities(this.data.liuyan)
    wx.setStorageSync('liuyan', liu)
    var that=this;
    wx.navigateTo({
      url:'../sendGift/sendGift?orderId='+this.data.orderId+'&src='+this.data.imgUrl2+'&userId='+app.globalData.userId+'&content='+liu+'&imageUrl='+this.data.alreadyUploadImageUrl+'&videoUrl='+this.data.alreadyUploadVideoUrl
    })
  },
  //点击转赠
  sendToSb: function () {
    if(!this.data.btnSend){
      return;
    }
    this.setData({
      'btnSend':false  //不可重复点击
    })
    var that = this
    if(that.data.img_src){
      that.uploadImage(function(val){
        //转赠订单提交
        that.submitSendToSomeOrder()
      },function(){
        that.setData({
          'btnSend':true  //不可重复点击
        })
      });
    }else if(that.data.video_src){
       that.uploadVideo(function(val){
        //转赠订单提交
        that.submitSendToSomeOrder()
      },function(){
        that.setData({
          'btnSend':true  //不可重复点击
        })
      });
    }else{
      //转赠订单提交
      that.submitSendToSomeOrder()
    }
  },
  onLoad: function (options) {
    var that = this
    // 获取用户信息
    that.setData({
      productId: options.productId,
      orderId: options.orderId
    })
    //请求产品信息
    wx.request({
      url:util.API()+"/api/product/queryGoodsDetail?id="+this.data.productId,
      method:'get',
      success: function(res){
        var giftImageUrl = '';
        var giftImageUrl2 = '';
        for(var i=0;i<res.data.content.middlePictures.length;i++){
          if(res.data.content.middlePictures[i].sortNo == 1){
            giftImageUrl = res.data.content.middlePictures[i].path
          }
          if(res.data.content.middlePictures[i].sortNo == 2){
            giftImageUrl2 = res.data.content.middlePictures[i].path
          }
        }
        wx.downloadFile({
          url: giftImageUrl2,
          success: function(res){
            if (res.statusCode === 200) {
              that.setData({
                imgUrl2: res.tempFilePath,//产品图片没有文案
              })
            }
          }
        })
        that.setData({
          good: res.data.content,
          imgUrl: giftImageUrl,
          price: res.data.content.buyPrice,
        })
        wx.setNavigationBarTitle({
          title: res.data.content.name
        })
      }
    })
    this.getLeaveWords();//随机请求留言
  },
  onReady: function () {

  },
  onShow: function () {
    this.setData({
      'btnSend':true
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
