// pages/product/product.js
import regeneratorRuntime from '../../packages/runtime.js';
import api from '../../utils/api';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    editProduct: false,
    products: [],
    tmpProducts: [],
    search: '',
    // 以下为编辑商品所需
    currentId: 0,
    showTopTips: false,
    files: [],
    product: {
      name: '',
      cash: '',
      price: '',
      image: '',
      image_id: ''
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._init();
  },
  _init(){
    let self = this;
    api.request({
      url: 'products',
      method: 'get'
    }, (res) => {
      self.data.products = JSON.parse(JSON.stringify(res.data));
      self.data.tmpProducts = JSON.parse(JSON.stringify(res.data));
      self.setData({
        tmpProducts: self.data.tmpProducts
      })
    });
  },
  // 商品搜索
  bindProductSearchInput(e, search =  false){
    if(!search){
      search = e.detail.value;
    }
    this.data.search = search
    
    let tmpProducts = JSON.parse(JSON.stringify(this.data.products));

    tmpProducts = tmpProducts.filter((item)=> {
      return (item.name.includes(search) || item.cash.includes(search))
    })

    this.setData({
      tmpProducts: tmpProducts
    })
  },
  // 自动获取条码
  go_scan: function (e) {
    let todos = e.currentTarget.dataset.todos;
    let self = this;

    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: function (res) {
        // 存在条形码
        if (res.result) {
          if (todos == 'search') {
            self.setData({
              'search': res.result
            })
            self.bindProductSearchInput('', res.result)
          }else{
            self.setData({
              'product.cash': res.result
            })
          }
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
  // 编辑商品
  edit_product(e){
    let self = this;
    let currId = e.currentTarget.id; 
    let currProduct = this.data.tmpProducts.filter((item)=> {
      return item.id == currId;
    })
    this.setData({
      currentId: currId
    })
    
    wx.showModal({
      title: '提示',
      content: '您确定要修改此商品吗 ?',
      success(res) {
        if (res.confirm) {
          if (currProduct.length > 0){
            self.reset_data(currProduct[0]);
            self.setData({
              editProduct: true,
              files: [currProduct[0]['image']]
            })
          }
        } else if (res.cancel) {
          
        }
      }
    })
  },
  // 表单提交
  submit: function () {
    let self = this;
    this.setData({ 'showTopTips': false })
    api.authRequest({
      url: 'products/' + self.data.currentId,
      method: 'POST',
      data: this.data.product
    }, (res) => {
      if (res.statusCode == 201 || res.statusCode == 200) {
        this.setData({
          'showTopTips': false,
          'editProduct': false,
        })
        self._init();
      } else {
        this.setData({'showTopTips': res.data.errors})
      }
    })
  },

  // 重置数据
  reset_data: function (data = {}) {
    this.setData({
      showTopTips: false,
      files: [],
      product: {
        name: data.name ? data.name : '',
        cash: data.cash ? data.cash : '',
        price: data.price ? data.price : '',
        image: data.image ? data.image : '',
        image_id: data.image_id ? data.image_id : ''
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
          success: function (imageResponse) {
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
})