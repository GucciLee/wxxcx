import api from '../../utils/api';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    product: [],
    totalNum: 0,
    totalPrices: '0.00'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._computed_prices();
  },

  /**
   * 调用wx.scanCode 扫描商品 [ 扫一扫( 并获取数据 ) ]
   * https://developers.weixin.qq.com/miniprogram/dev/api/wx.scanCode.html
   */
  go_scan: function(){
    let self = this;
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode', 'datamatrix', 'pdf417'],
      success: function (res) {
        // 存在条形码
        if (res.result){
          api.request({
            url: `products/${res.result}`,
            method: 'get',
          }, (res)=> {
            let data = res.data;
            if (res.statusCode == 200 || res.statusCode == 201){
              if(data.length > 0){
                self.setData({
                  product: data.concat(self.data.product)
                })
                self._computed_prices();
              }else{
                wx.showModal({
                  title: '提示',
                  content: '未录入此商品 !',
                  showCancel: false,
                })
              }
            }else{
              wx.showModal({
                title: '提示',
                content: '未录入此商品 !',
                showCancel: false,
              })
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '扫描商品失败, 请重新扫描',
            showCancel: false,
          })
        }
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '扫描商品失败, 请重新扫描',
          showCancel: false,
        })
      }
    })
  },
  /**
   * 减少一条 当前商品
   */
  product_prev: function (event){
    let index = event.currentTarget.dataset['index'];
    let product = this.data.product;

    let value = --product[index].num;
    if(value <= 1){
      value = 1;
    }
    product[index].num = value;

    this.setData({ product });
    this._computed_prices(); 
  },
  /**
   * 增加一条 当前商品
   */
  product_next: function (event){
    let index = event.currentTarget.dataset['index'];
    let product = this.data.product;

    product[index].num++;

    this.setData({product});
    this._computed_prices();
  },
  /**
   * 删除 当前商品
   */
  product_remove: function(event){
    let self = this;
    wx.showModal({
      title: '提示',
      content: '您确定要删除此商品吗 ?',
      success(res) {
        if (res.confirm) {
          let index = event.currentTarget.dataset['index'];
          let product = self.data.product;
          product.splice(index, 1);
          self.setData({ product });
          self._computed_prices();
        }
      }
    })
  },

  /** 产品 结算 */
  shop_booking: function(){
    wx.showModal({
      title: '请支付',
      content: "您所购商品总价为: 【 " + this.data.totalPrices + "元 】",
      showCancel: false,
      success(res) { }
    })
  },

  /** 计算总价 信息 */
  _computed_prices: function(){
    // 所有商品总价
    let totalPrices = 0;
    this.data.product.forEach((item, index) => {
      let price = Number(item.price).toFixed(2) * Number(item.num).toFixed(2);
      totalPrices += price;
    })
    this.setData({
      'totalNum': this.data.product.length,
      'totalPrices': totalPrices.toFixed(2)
    })
  }
})