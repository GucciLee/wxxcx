import regeneratorRuntime from '../../packages/runtime.js';
import api from '../../utils/api';


Page({
  data: {
    showTopTips: false,
    files: [],
    product: {
      name:'',
      cash: '',
      price: '',
      image: '',
      image_id: ''
    },
  },
  reset_data: function(){
    this.setData({
      showTopTips: false,
      files: [],
      product: {
        name: '',
        cash: '',
        price: '',
        image: '',
        image_id: ''
      }
    })
  },
  // 表单提交
  submit: function(){
    let self = this;
    api.authRequest({
      url: 'products',
      method: 'POST',
      data: this.data.product
    },(res)=> {
      if (res.statusCode == 201 || res.statusCode == 200){
        wx.showModal({
          title: '提示',
          content: '添加成功, 是否继续添加商品 ?',
          success(res) {
            if (res.confirm) {
              self.reset_data();
            } else if (res.cancel) {
              wx.switchTab({
                url: '/pages/user/user'
              })
            }
          }
        })
      }else{
        console.log(res);
        this.setData({
          'showTopTips': res.data.errors
        })
        console.log(this.data.showTopTips)
      }
    })
  },
  // 扫码条码
  go_scan: function(){
    let self = this;
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode', 'datamatrix', 'pdf417'],
      success: function (res) {
        // 存在条形码
        if (res.result) {
          self.setData({
            'product.cash': res.result
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
  // 图片上传
  updateImage: function (e) {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (image) {
        // 获取选择的图片
        let product_img = image.tempFilePaths[0]

        api.updateFile({
          url: 'images',
          method: 'POST',
          name: 'image',
          formData: {
            type: 'product'
          },
          filePath: product_img,
          success: function (imageResponse){
            // 上传成功成功记录数据
            if (imageResponse.statusCode === 201 || imageResponse.statusCode === 200) {
              // 小程序上传结果没有做 JSON.parse，需要手动处理
              let responseData = JSON.parse(imageResponse.data)

              that.data.product.image_id = responseData.id;

              that.setData({
                files: image.tempFilePaths,
                'product.image': responseData.path
              });
            }
          }
        })
        
      }
    })
  },
  // 展示大图
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  bindProductNameInput(e) {
    this.data.product.name = e.detail.value
  },
  bindProductPriceInput(e) {
    this.data.product.price = e.detail.value
  },
  bindProductCashInput(e) {
    this.data.product.cash = e.detail.value
  }
});