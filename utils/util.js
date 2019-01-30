/**
 * 使小程序支持 async await
 */
import regeneratorRuntime from '../packages/runtime.js';

/**
 * 封装 wx.request 函数 使其支持 async await
 */
const wxRequest = async (params = {}, statusCode=201) => {
  function _params(resolve, reject){
    return Object.assign({}, params, {
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      },
      complete: (e) => {
        wx.hideLoading()
      }
    })
  }

  let res = await new Promise((resolve, reject) => {
    wx.request(_params(resolve, reject))
  })
  return res
}


/**
 * 封装 wx.login 函数 使其支持 async await
 */
const wxLogin = async () => {
  let res = await new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          resolve(res);
        } else {
          reject(res);
        }
      }
    })
  })
  return res
}

module.exports = {
  wxLogin: wxLogin,
  wxRequest: wxRequest
}
