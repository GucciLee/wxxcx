//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  /** 监听页面加载 */
  onLoad: function () {
    // console.log(this.userInfo)
  },
  /** 页面初次渲染完成 */
  onReady: function(){

  },
  /** 扫一扫条形码 */
  scan_product: function(){
    wx.navigateTo({
      url: '../cart/cart',
      success: function (res) { }
    })
  }
})
