// 服务器接口地址
const host = 'http://larabbs.test/api';

// 普通请求
const request = async (options, showLoading = true) => {
  // 简化开发，如果传入字符串则转换成 对象
  if (typeof options === 'string') {
    options = {
      url: options
    }
  }
  // 显示加载中
  if (showLoading) {
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
  }
  // 拼接请求地址
  options.url = host + '/' + options.url
  // 调用小程序的 request 方法
  let response = await wx.request(options)

  if (showLoading) {
    // 隐藏加载中
    wx.hideToast()
  }

  // 服务器异常后给与提示
  if (response.statusCode === 500) {
    wx.showModal({
      title: '提示',
      content: '服务器错误，请联系管理员或重试'
    })
  }
  return response
}

export default {
  request
}