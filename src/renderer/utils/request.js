import Vue from 'vue'
import axios from 'axios'
// require('es6-promise').polyfill()
// require('promise.prototype.finally').shim()
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

const baseURL = 'http://niuba.siweiquanjing.com'
Vue.http.defaults.baseURL = baseURL
Vue.http.defaults.timeout = 5000
Vue.http.interceptors.request.use(function (config) {
  /* for (var i in config.params) {
    if (typeof config.params[i] === 'string' && config.params[i].indexOf('?') !== -1) {
      config.params[i] = config.params[i].substring(0, config.params[i].indexOf('?'))
    }
  } */
  // Do something before request is sent
  /*if (localStorage.getItem('tId')) {
    config.headers['tId'] = localStorage.getItem('tId')
  }*/
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

const request = (url, method = 'POST', data = {}) => {
  if (method === 'POST') {
    return Vue.http.post(url, data).then((response) => {
      if (response.data.code !== '306000' && response.data.code !== '301001') {
        /*Vue.$vux.toast.show({
          text: response.data.result,
          position: 'bottom',
          type: 'text',
          time: 1500,
          width: '10em'
        })*/
        return Promise.reject(response.data.result)
      } else if (response.data.code === '301001') {
        return Promise.reject(response.data.result)
      } else {
        return Promise.resolve(response.data)
      }
    }, (error) => {
      let errors = ''
      if (error.response) {
        // errors = error.response.data
        errors = '请求错误'
      } else if (error.request) {
        errors = error.request
      } else {
        errors = error.message.indexOf('timeout') !== -1 ? '请求超时' : error.message
      }
      return Promise.reject(errors)
    })
  } else {
    return Vue.http.get(url, {params: data}).then((response) => {
      return Promise.resolve(response.data)
    }, (error) => {
      if (error.response) {
        return Promise.reject(error.response.data)
      } else if (error.request) {
        return Promise.reject(error.request)
      } else {
        return Promise.reject(error.message)
      }
    })
  }
}

export default request
