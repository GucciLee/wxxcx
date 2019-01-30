import regeneratorRuntime from '../../packages/runtime.js';
import api from '../../utils/api';


Page({
  data: {
    showTopTips: false,
    product: {
      name:'',
      cash: '',
      price: '',
      image: ''
    },
  },
  // 表单提交
  submit: function(){
    api.authRequest({
      url: 'products',
      method: 'POST',
      data: this.data.product
    },(res)=> {
      console.log(res)
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
            type: 'avatar'
          },
          filePath: product_img,
          complete: function (imageResponse){
            console.log(imageResponse)
            // 上传成功成功记录数据
            if (imageResponse.statusCode === 201) {
              // 小程序上传结果没有做 JSON.parse，需要手动处理
              let responseData = JSON.parse(imageResponse.data)
              console.log(responseData);
            }
          }
        })
        /*that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });*/
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