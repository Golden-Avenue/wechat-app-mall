// pages/category/category.js

const WXAPI = require('../../wxapi/main')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    categories: [],
    categorySelected: {
      name: '',
      id: ''
    },
    jiesuanInfo: {
      hideSummaryPopup: true,
      totalPrice: 0,
      totalScore: 0,
      shopNum: 0
    },
    currentGoods: [],
    onLoadStatus: true,
    scrolltop: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.categories();
  },
  async categories() {
    wx.showLoading({
      title: '加载中',
    })
    const res = await WXAPI.goodsCategory()
    wx.hideLoading()
    let categories = [];
    let categoryName = '';
    let categoryId = '';
    if (res.code == 0) {
      for (let i = 0; i < res.data.length; i++) {
        let item = res.data[i];
        categories.push(item);
        if (i == 0) {
          categoryName = item.name;
          categoryId = item.id;
        }
      }
    }
    this.setData({
      categories: categories,
      categorySelected: {
        name: categoryName,
        id: categoryId
      }
    });
    this.getGoodsList();
  },
  async getGoodsList() {
    wx.showLoading({
      title: '加载中',
    })
    const res = await WXAPI.goods({
      categoryId: this.data.categorySelected.id,
      page: 1,
      pageSize: 100000
    })
    wx.hideLoading()
    if (res.code == 700) {
      this.setData({
        currentGoods: null
      });
      return
    }
    this.setData({
      currentGoods: res.data
    });
  },
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onCategoryClick: function(e) {
    var that = this;
    var id = e.target.dataset.id;
    if (id === that.data.categorySelected.id) {
      that.setData({
        scrolltop: 0,
      })
    } else {
      var categoryName = '';
      for (var i = 0; i < that.data.categories.length; i++) {
        let item = that.data.categories[i];
        if (item.id == id) {
          categoryName = item.name;
          break;
        }
      }
      that.setData({
        categorySelected: {
          name: categoryName,
          id: id
        },
        scrolltop: 0
      });
      that.getGoodsList();
    }
  },
  onTotalPriceChange: function (e) {
    let hideSummaryPopup = true;
    if (e.detail.totalPrice > 0) {
      hideSummaryPopup = false;
    }
    this.setData({
      jiesuanInfo: {
        hideSummaryPopup: hideSummaryPopup,
        totalPrice: e.detail.totalPrice,
        totalScore: e.detail.totalScore,
        shopNum: e.detail.shopNum
      }
    });

  },


  navigateToCartShop: function () {
    wx.hideLoading();
    wx.switchTab({
      url: "/pages/shop-cart/index"
    })
  },
  onShow: function () {
    this.refreshTotalPrice();
  },
  resetGoodsBuyNum: function () {
    var goodsWrap = this.data.goodsWrap;
    if (goodsWrap.length > 0) {
      for (var i = 0; i < goodsWrap.length; i++) {
        var goods = goodsWrap[i].goods;
        for (var j = 0; j < goods.length; j++) {
          goods[j].buyNum = 0;
        }
      }
    }
  },
  refreshTotalPrice: function () {
    var shopCarInfo = wx.getStorageSync('shopCarInfo');
    var goodsWrap = this.data.goodsWrap;
    this.resetGoodsBuyNum();
    let hideSummaryPopup = true;
    let totalPrice = 0;
    let totalScore = 0;
    let shopNum = 0;
    if (shopCarInfo) {
      totalPrice = shopCarInfo.totalPrice;
      totalScore = shopCarInfo.totalScore;
      shopNum = shopCarInfo.shopNum;

      if (shopNum > 0 && shopCarInfo.shopList && shopCarInfo.shopList.length > 0) {
        hideSummaryPopup = false;
        if (goodsWrap.length > 0) {
          for (var j = 0; j < shopCarInfo.shopList.length; j++) {
            var tmpShopCarMap = shopCarInfo.shopList[j];
            if (tmpShopCarMap.active) {
              for (var i = 0; i < goodsWrap.length; i++) {
                var goods = goodsWrap[i].goods;
                for (var p = 0; p < goods.length; p++) {
                  if (tmpShopCarMap.goodsId === goods[p].id) {
                    goods[p].buyNum = tmpShopCarMap.number;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }

    this.setData({
      jiesuanInfo: {
        hideSummaryPopup: hideSummaryPopup,
        totalPrice: totalPrice,
        totalScore: totalScore,
        shopNum: shopNum,
      },
      goodsWrap: goodsWrap
    });
  },
  navigateToPayOrder: function (e) {
    wx.hideLoading();
    wx.navigateTo({
      url: "/pages/to-pay-order/index"
    })
  },
  bindinput(e) {
    this.setData({
      inputVal: e.detail.value
    })
  },
  bindconfirm(e) {
    this.setData({
      inputVal: e.detail.value
    })
    wx.navigateTo({
      url: '/pages/goods/list?name=' + this.data.inputVal,
    })
  },
})
