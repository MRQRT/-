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
    goodId:'',//产品Id
    good:'',//产品的详细参数
    imgUrl: '',//产品图片地址有文案
    imgUrl2: '',//产品图片地址没有文案
    orderId:'',//预支付下单订单号
    wordsId:'', //留言模板id
    alreadyUploadImageUrl: '',//图片上传成功后的地址
    alreadyUploadVideoUrl: '',//视频上传成功后的地址
    wordLength:0, //留言长度
    maxLenth:50, //留言最大长度
    quantity:'',//库存
    sending:false, //是否在调用统一下单接口
    canBuy:true, //可不可以再次点击购买
    percent:0, //下载进度
    proHidden:false, //进度条消失
    detailClick:[], //存放点击’产品详情‘时间
  },
  //视频和图片选择的模态框
  modal: function () {
    var that = this
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
  //预览图片
  previewPic(e){
    var src=e.currentTarget.dataset.src;
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: [src] // 需要预览的图片http链接列表
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
   var date=new Date().getTime();
   var arr=this.data.detailClick.concat([date])
   this.setData({
    'detailClick':arr
   })
   if(this.data.detailClick[this.data.detailClick.length-1]-this.data.detailClick[this.data.detailClick.length-2]<300){
      return;
   }
    wx.navigateTo({
      url: "../goodsDetail/goodsDetail?id="+this.data.goodId
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
          that.setData({
            'wordsId':res.data.content.id,
            'liuyan':res.data.content.content.slice(0,50)
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
  uploadImage: function(cb){
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
        fail:function(err){
          console.error(err)
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
  uploadVideo: function(cb){
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
        fail:function(err){
          console.error(err)
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
  //微信支付
  recharge: function (value,value2) {
    var url1='',url2='',url3='';
    if(value2=='img'){
      url1 = value
    }else if(value2=='video'){
      url2 = value
    }else if(value2=='none'){
      url3 = null
    }
    var liu=this.utf16toEntities(this.data.liuyan)
    var date = new Date().getTime();//随机生成时间戳
    var nonceStr = util.randomString(32);//随机生成32个字符串
    var productId = this.data.goodId;//产品Id
    var that = this;
    if(wx.getStorageSync('openId')){ //以获取过openid
      var openid = wx.getStorageSync('openId')
      wx.request({
        url:util.API()+'/weixin/preparePay',//请求接口统一下单
        method:'POST',
        data:{
          'timeStamp': date,
          'nonceStr': nonceStr,
          'openId': openid,
          'productId': productId,
          // 'content': that.data.liuyan,
          'content': liu,
          'imageUrl': url1,
          'videoUrl': url2
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        dataType:'json',
        success:function(res){
          if(res.data.code>0){
            // wx.showToast({
            //   'title': '频繁操作,5秒后重试',
            //   'image':'../../images/gantanhao.png',
            //   'mask': true
            // })
          }else{
            that.setData({
              'orderId':res.data.orderId,  //保存orderID
            })
            //调起微信支付窗口
            wx.requestPayment({
               'timeStamp': date+'',
               'nonceStr': nonceStr,
               'package': res.data.package,
               'signType': 'MD5',
               'paySign': res.data.paySign,
               'success': function (result) {
                  wx.navigateTo({
                      url:'../sendGift/sendGift?orderId='+that.data.orderId+'&src='+that.data.imgUrl2+'&userId='+app.globalData.userId+'&content='+liu+'&imageUrl='+that.data.alreadyUploadImageUrl+'&videoUrl='+that.data.alreadyUploadVideoUrl
                  })
                },
                fail: function (res) {
                 that.setData({
                   'canBuy':true
                 })
                },
                //用户取消微信支付会走到这个回调
                complete:function(result){
                  wx.setStorageSync('liuyan', liu)
                }
            })
          }
        },
        fail:function(r){
          console.error(r)
          that.setData({
           'canBuy':true
         })
        }
      })
    }else{ //没有openid需先获取
      wx.login({
        success: function (res) {
          if (res.code) {
            wx.request({
              url: util.API()+'/getOpenId?jsCode=' + res.code,
              method: 'GET',
              success: function (res) {
                app.globalData.openId = res.data.openid
                wx.setStorageSync('openId', res.data.openid)
                that.recharge()
              },
            })
          }
        }
      })
    }
  },
  //订单提交
  buyOrderSubmit: function(){
    var that = this
    /*数量校验*/
    if(that.data.quantity==0){
      wx.showToast({
        'title': '库存为0',
        'image':'../../images/gantanhao.png',
        'mask': true,
      })
    }else{
      if(that.data.img_src){
        that.uploadImage(function(val){
          that.recharge(val,'img')
        });
      }else if(that.data.video_src){
        that.uploadVideo(function(val){
          that.recharge(val,'video')
        });
      }else{
        that.recharge('none','none')
      }
    }
  },
  //点击购买
  buy: function () {
    if(!this.data.canBuy){
      return;
    }
    this.setData({
      'canBuy':false
    })
    var that=this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          //用户已授权，提交订单
          that.buyOrderSubmit()
        }else {
          wx.showModal({
            title: '提示',
            content: '您点击了拒绝授权,将无法正常获取个人信息,点击确定重新获取授权。',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting["scope.userInfo"]) {////如果用户重新同意了授权登录
                      wx.login({
                        success: function (res_login) {
                          wx.getUserInfo({
                            withCredentials: true,
                            success: function (res_user) {
                              app.globalData.userInfo = res_user.userInfo;
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
                                  console.log(res)
                                  app.globalData.userId = res.data.content.id
                                }
                              })
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
  onLoad: function (options) {
    var that = this
    // 获取用户信息
    that.setData({
      goodId: options.id
    })
    //请求产品信息
    wx.request({
      url:util.API()+"/api/product/queryGoodsDetail?id="+this.data.goodId,
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
          imgUrl: giftImageUrl,//产品图片有文案
          price: res.data.content.buyPrice,
          quantity: res.data.content.quantity
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
       'canBuy':true,
       'detailClick':[]
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
