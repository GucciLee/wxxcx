import regeneratorRuntime from '../packages/runtime.js';
import { wxLogin, wxRequest} from 'util.js';

// 服务器接口地址
const host = 'https://www.jsjie.top/api'

/**
 * 普通请求
 *  api.request({url: 'products/index',},(res)=> {
 *    console.log(res)
 *  })
 */
const request = async (options, callback = false, showLoading = true) => {
  if (typeof options === 'string') {
    options = {
      url: options
    }
  }
  // 显示加载中
  if (showLoading) {
    wx.showLoading({ title: '加载中' })
  }
  // 拼接请求地址
  options.url = host + '/' + options.url
  // 调用小程序的 request 方法
  let response = await wxRequest(options)

  if (showLoading) {
    // 隐藏加载中
    wx.hideLoading()
  }

  /*if (response.statusCode >= 400){
    if (response.data.message != ''){
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: response.data.message
      })
      return;
    }
  }*/

  // 服务器异常后给与提示
  if (response.statusCode === 500) {
    wx.showModal({
      title: '提示',
      content: '服务器错误，请联系管理员或重试'
    })
    return;
  }
  if (callback){
    return callback(response);
  } else {
    return response
  }
}

// 登录
const login = async (params = {}, callback = false) => {
  // code 只能使用一次，所以每次单独调用
  let loginData = await wxLogin()

  // 参数中增加code
  params.code = loginData.code

  // 接口请求 weapp/authorizations
  let authResponse = await request({
    url: 'weapp/authorizations',
    data: params,
    method: 'POST'
  })

  if (authResponse){
    // 登录成功，记录 token 信息
    if (authResponse.statusCode === 201) {
      wx.setStorageSync('access_token', authResponse.data.access_token)
      wx.setStorageSync('access_token_expired_at', new Date().getTime() + authResponse.data.expires_in * 1000)
    }

    if (callback) {
      callback(authResponse);
    } else {
      return authResponse
    }
  }
}

// 刷新 Token
const refreshToken = async (accessToken, callback = false) => {
  // 请求刷新接口
  let refreshResponse = await wxRequest({
    url: host + '/' + 'authorizations/current',
    method: 'PUT',
    header: {
      'Authorization': 'Bearer ' + accessToken
    }
  })

  // 刷新成功状态码为 200
  if (refreshResponse.statusCode === 200) {
    // 将 Token 及过期时间保存在 storage 中
    wx.setStorageSync('access_token', refreshResponse.data.access_token)
    wx.setStorageSync('access_token_expired_at', new Date().getTime() + refreshResponse.data.expires_in * 1000)
  }

  if (callback) {
    callback(refreshResponse);
  } else {
    return refreshResponse
  }
}


// 获取 Token
const getToken = async (options, callback = false) => {
  // 从缓存中取出 Token
  let accessToken = wx.getStorageSync('access_token')
  let expiredAt = wx.getStorageSync('access_token_expired_at')

  // 如果 token 过期了，则调用刷新方法
  if (accessToken && new Date().getTime() > expiredAt) {
    let refreshResponse = await refreshToken(accessToken)

    // 刷新成功
    if (refreshResponse.statusCode === 200) {
      accessToken = refreshResponse.data.access_token
    } else {
      // 刷新失败了，重新调用登录方法，设置 Token
      let authResponse = await login()
      if (authResponse.statusCode === 201) {
        accessToken = authResponse.data.access_token
      }
    }
  }

  if (callback) {
    callback(accessToken);
  } else {
    return accessToken
  }
}

// 带身份认证的请求
const authRequest = async (options, callback = false, showLoading = true) => {
  if (typeof options === 'string') {
    options = {
      url: options
    }
  }
  // 获取Token
  let accessToken = await getToken()

  // 将 Token 设置在 header 中
  let header = options.header || {}
  header.Authorization = 'Bearer ' + accessToken
  options.header = header

  request(options, callback, showLoading)
}

//  退出登录
const logout = async (params = {}) => {
  let accessToken = wx.getStorageSync('access_token')
  // 调用删除 Token 接口，让 Token 失效
  let logoutResponse = await wxRequest({
    url: host + '/' + 'authorizations/current',
    method: 'DELETE',
    header: {
      'Authorization': 'Bearer ' + accessToken
    }
  })

  // 调用接口成功则清空缓存
  if (logoutResponse.statusCode === 204) {
    wx.clearStorage()
  }

  if (callback) {
    callback(logoutResponse);
  } else {
    return logoutResponse
  }
}

const updateFile = async (options = {}, callback = false) => {
  // 显示loading
  wx.showLoading({ title: '上传中' })

  // 获取 token
  let accessToken = await getToken()

  // 拼接url
  options.url = host + '/' + options.url
  let header = options.header || {}
  // 将 token 设置在 header 中
  header.Authorization = 'Bearer ' + accessToken
  options.header = header

  // 上传文件
  let response = await wx.uploadFile(options)

  // 隐藏 loading
  wx.hideLoading()

  if (callback) {
    callback(response);
  } else {
    return response
  }
}

export default {
  request,
  authRequest,
  refreshToken,
  login,
  logout,
  updateFile
}