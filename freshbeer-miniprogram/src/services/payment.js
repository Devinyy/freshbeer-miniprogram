import { callCloud } from '@/utils/request'

/** 创建订单（云函数 createOrder） */
export const createOrder = (orderData) => callCloud('createOrder', orderData)

/**
 * 发起支付。
 * 真实环境：云函数 payOrder 返回微信 prepay 参数，前端 uni.requestPayment 拉起收银台。
 * Mock 环境：prepay package 含 'mock' 前缀，直接跳过真实支付视为成功。
 */
export async function payOrder(orderId, method = 'wechat') {
  const res = await callCloud('payOrder', { orderId, method })
  if (!res || !res.order) return { success: false, reason: 'create_failed' }

  if (method === 'balance') {
    return { success: true, order: res.order, balance: true }
  }

  // #ifdef MP-WEIXIN
  const pp = res.payParams
  if (!pp) return { success: false, reason: 'payment_failed' }
  if (pp && pp.package && pp.package.indexOf('mock') >= 0) {
    // Mock：跳过微信支付
    return { success: true, order: res.order, mock: true }
  }
  return new Promise((resolve) => {
    uni.requestPayment({
      timeStamp: pp.timeStamp,
      nonceStr: pp.nonceStr,
      package: pp.package,
      signType: pp.signType,
      paySign: pp.paySign,
      success: () => resolve({ success: true, order: res.order }),
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('cancel') >= 0) {
          resolve({ success: false, reason: 'cancelled' })
        } else {
          resolve({ success: false, reason: 'payment_failed', err })
        }
      }
    })
  })
  // #endif

  // #ifndef MP-WEIXIN
  return { success: true, order: res.order, mock: true }
  // #endif
}
