'use strict'
// 云函数：微信支付 prepay
// 流程：createOrder 拿到 orderId -> 本函数调用微信【统一下单】API 获取 prepay_id
//       -> 用 prepay_id 等参数按微信规则签名 -> 返回 payParams 给前端 uni.requestPayment。
//
// ⚠️ 部署前必须配置（建议放环境变量 / uniCloud 环境配置）：
//   WX_MCH_ID      微信支付商户号
//   WX_PAY_API_KEY 商户 APIv2 密钥（商户平台设置）
//   WX_APPID       小程序 AppID
//   NOTIFY_URL      支付结果异步回调地址（需公网可访问，部署时替换为你的云函数 HTTP 触发地址）
//
// 统一下单使用微信支付 API v2 XML 协议；未配置商户参数时保留演示占位。

const crypto = require('crypto')

const MCH_ID = process.env.WX_MCH_ID || 'YOUR_MCH_ID'
const API_KEY = process.env.WX_PAY_API_KEY || 'YOUR_API_KEY'
const APPID = process.env.WX_APPID || 'YOUR_WX_APPID'
const NOTIFY_URL = process.env.WX_PAY_NOTIFY || 'https://your-domain.com/notify'

function md5(str) {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase()
}
function buildSign(params) {
  const keys = Object.keys(params)
    .filter((k) => params[k] !== '' && params[k] !== undefined && params[k] !== null)
    .sort()
  const str = keys.map((k) => `${k}=${params[k]}`).join('&') + '&key=' + API_KEY
  return md5(str)
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toXml(params) {
  return '<xml>' + Object.keys(params).map((key) => `<${key}><![CDATA[${escapeXml(params[key])}]]></${key}>`).join('') + '</xml>'
}

function parseXml(xml) {
  const result = {}
  String(xml || '').replace(/<([a-zA-Z0-9_]+)>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/\1>/g, (_, key, cdata, text) => {
    result[key] = cdata !== undefined ? cdata : text
    return ''
  })
  return result
}

exports.main = async (event) => {
  const { orderId, openid, method } = event
  const db = uniCloud.database()
  let order = (await db.collection('orders').doc(orderId).get()).data[0]
  if (!order) order = (await db.collection('orders').where({ orderId }).limit(1).get()).data[0]
  if (!order) return { code: -1, msg: '订单不存在' }
  if (order.status !== 'pending_pay') return { order, payParams: null }

  const resolvedOpenid = openid || order.openid || (event.userInfo && event.userInfo.openId) || ''
  if (method === 'balance') {
    if (!resolvedOpenid) return { code: -4, msg: '余额支付缺少用户身份' }
    const userRes = await db.collection('users').where({ openid: resolvedOpenid }).limit(1).get()
    const user = userRes.data[0]
    if (!user || Number(user.balance || 0) < Number(order.payable || 0)) {
      return { code: -5, msg: '储值卡余额不足' }
    }
    await db.collection('users').doc(user._id).update({ balance: db.command.inc(-Number(order.payable || 0)) })
    const paidAt = Date.now()
    await db.collection('orders').doc(order._id || orderId).update({ status: 'preparing', paidAt, payMethod: 'balance' })
    return { order: { ...order, status: 'preparing', paidAt, payMethod: 'balance' }, payParams: null }
  }

  const nonceStr = Math.random().toString(36).slice(2, 18)

  let prepayId = ''
  const configured = ![MCH_ID, API_KEY, APPID].some((v) => String(v).startsWith('YOUR_'))
  if (configured) {
    if (!resolvedOpenid) return { code: -6, msg: '微信支付缺少 openid' }
    const unifiedParams = {
      appid: APPID,
      mch_id: MCH_ID,
      nonce_str: nonceStr,
      body: '鲜啤到-精酿订单',
      out_trade_no: order.orderId,
      total_fee: Math.round(Number(order.payable) * 100),
      spbill_create_ip: event.clientIP || '127.0.0.1',
      notify_url: NOTIFY_URL,
      trade_type: 'JSAPI',
      openid: resolvedOpenid
    }
    unifiedParams.sign = buildSign(unifiedParams)
    const response = await uniCloud.httpclient.request({
      url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
      method: 'POST',
      data: toXml(unifiedParams),
      contentType: 'text/xml',
      dataType: 'text'
    })
    const payload = parseXml(response.data)
    if (payload.return_code !== 'SUCCESS' || payload.result_code !== 'SUCCESS' || !payload.prepay_id) {
      return { code: -7, msg: payload.err_code_des || payload.return_msg || '微信统一下单失败' }
    }
    prepayId = payload.prepay_id
  } else {
    prepayId = 'prepay_id_demo_' + orderId
  }

  const timeStamp = String(Math.floor(Date.now() / 1000))
  const payParams = {
    timeStamp,
    nonceStr,
    package: 'prepay_id=' + prepayId,
    signType: 'MD5',
    paySign: buildSign({
      appId: APPID,
      timeStamp,
      nonceStr,
      package: 'prepay_id=' + prepayId,
      signType: 'MD5'
    })
  }

  await db.collection('orders').doc(order._id || orderId).update({
    status: 'preparing',
    paidAt: Date.now(),
    payMethod: event.method || 'wechat'
  })
  order.status = 'preparing'
  order.paidAt = Date.now()
  order.payMethod = event.method || 'wechat'

  return { order, payParams }
}
