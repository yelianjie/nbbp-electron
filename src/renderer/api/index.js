import request from '../utils/request'

export const changeBgType = (data) => {
    return request('/weixin/Screen/changeBgType', 'POST', data)
}