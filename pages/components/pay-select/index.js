// pages/components/pay-select/index.js
import imageUtil from '../../../utils/image'

Component({
  properties: {
    buyNum: {
      type: Number
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    payType: 'wxpay'
  },
  lifetimes: {
    attached: function () {
      // 页面被展示
      this.showQrcodeImg('wxpay')
    },
  },
  methods: {
    cancelModal: function() {
      this.triggerEvent("cancelModal");
    },
    showQrcodeImg: function (payType) {
      var that = this;
      wx.getImageInfo({
        src: payType == 'wxpay' ? wx.getStorageSync('wxpay_img_url') : wx.getStorageSync('alipay_img_url'),
        success: (res) => {
          const imageSize = imageUtil(res.width, res.height)
          const qrcodeWidth = imageSize.windowWidth / 2
          let ctx = wx.createCanvasContext('myQrcode', that)
          ctx.setFillStyle('#fff')
          ctx.fillRect(0, 0, imageSize.windowWidth, imageSize.imageHeight + qrcodeWidth)
          ctx.drawImage(res.path, 50, 0, qrcodeWidth, qrcodeWidth)
          ctx.draw()
        }
      })
    },
    saveToMobile: function () {
      const that = this; 
      var data = {}
      //this.triggerEvent("saveToMobile", data);
      wx.canvasToTempFilePath({
        canvasId: 'myQrcode',
        success: function (res) {
          let tempFilePath = res.tempFilePath
          wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success: (res) => {
              wx.showModal({
                content: '已保存到手机相册，请尽快扫码付款',
                showCancel: false,
                confirmText: '知道了',
                confirmColor: '#333'
              })
              that.triggerEvent("cancelModal");
            },
            fail: (res) => {
              wx.showToast({
                title: res.errMsg,
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }, this)
    },
    payTypeRadioChange(e) {
      this.setData({
        payType: e.detail.value
      })
      this.showQrcodeImg(e.detail.value)
    },
    setBuyNum: function(e) {
      this.setData({
        buyNum: e.detail.value
      });
    },
    jianBtnTap: function() {
      this.setData({
        buyNum: this.data.buyNum - 1
      });
    },
    jiaBtnTap: function() {
      this.setData({
        buyNum: this.data.buyNum + 1
      });
    }
  }
})