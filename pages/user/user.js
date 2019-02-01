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
    }else{
      this.submit('currentParams');
    }
  },
  // 新增产品
  insert_product(){
    wx.navigateTo({
      url: '../insert/insert'
    })
  },
  // 产品列表
  index_product() {
    wx.navigateTo({
      url: '../product/product'
    })
  },
  // 生成静态数据
  build_static_json(){
    api.request({
      'url': 'products/build_static_json',
      'method': 'GET'
    }, (res)=> {
      if (res.data.status_code === 201){
        wx.showModal({
          title: '提示',
          content: '静态文件重置成功',
          showCancel: false
        })
      }
    })
  },
  // 清除本地缓存数据
  clear_local_store(){
    wx.clearStorage();
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
  submit(e, params = {}){
    let currentParams = false;
    if (e === 'currentParams'){
      currentParams = true;
    }
    // 提交时重置错误
    this.setData({
      'error': false,
      'errorMessage': ''
    })

    if (!currentParams){
      if (!this.username || !this.password) {
        this.setData({
          'errorMessage': '请填写「用户名」和「密码」'
        });
        return
      }

      // 获取用户名和密码
      params = {
        username: this.username,
        password: this.password
      }
    }

    wx.showLoading({
      title: '加载中'
    })

    // 登录
    api.login(params, (res)=>{
      if (res.data.access_token){
        this.setData({
          loggedIn: true
        })
      }else{
        if(!currentParams){
          let error = '登录失败, 具体原因请联系管理员';
          if (res.data.message) {
            error = res.data.message;
          } 
          this.setData({
            'errorMessage': error,
            'error': false
          });
        }
      }
    });
  },
  // 退出登录
  logout(){
    wx.hideLoading();
    this.clear_local_store();
    this.setData({
      loggedIn: false,
      errorMessage: '',
      error: false
    })
  }
})