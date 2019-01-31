// pages/user/user.js
import api from '../../utils/api';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 登录状态
    loggedIn: false,
    // 用户名
    username: '',
    // 密码
    password: '',
    // 是否有错
    error: false,
    // 错误信息
    errorMessage: ''
  },
  onShow(){
    // 登录
    if (wx.getStorageSync('access_token')) {
      this.setData({loggedIn: true})
    }
  },
  insert_product(){
    wx.navigateTo({
      url: '../insert/insert'
    })
  },
  index_product() {
    wx.navigateTo({
      url: '../product/product'
    })
  },
  edit_product(){
    wx.navigateTo({
      url: '../insert/insert'
    })
  },
  // 绑定用户名 input 变化
  bindUsernameInput(e) {
    this.username = e.detail.value
  },
  // 绑定密码 input 变化
  bindPasswordInput(e) {
    this.password = e.detail.value
  },
  // 表单提交
  submit(){
    // 提交时重置错误
    this.setData({
      'error': false
    })

    this.setData({
      'errorMessage': ''
    });

    if (!this.username || !this.password) {
      this.setData({
        'errorMessage': '请填写账户名和密码'
      });
      return
    }

    // 获取用户名和密码
    let params = {
      username: this.username,
      password: this.password
    }

    wx.showLoading({
      title: '加载中'
    })

    // 登录
    api.login(params, (res)=>{
      this.setData({
        loggedIn: true
      })
    });
  },
})