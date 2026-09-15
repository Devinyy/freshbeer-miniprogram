'use strict'

exports.main = async (event) => {
  const { orderId, reason, note, amount } = event
  const db = uniCloud.database()
  let result = await db.collection('orders').doc(orderId).get()
  let order = result.data[0]
  if (!order) {
    result = await db.collection('orders').where({ orderId }).limit(1).get()
    order = result.data[0]
  }
  if (!order) return { code: -1, msg: '订单不存在' }
  if (!['preparing', 'delivering', 'done'].includes(order.status)) {
    return { code: -2, msg: '当前订单状态不可退款' }
  }
  if (order.refundStatus === 'pending' || order.refundStatus === 'approved') {
    return { code: -3, msg: '退款申请已存在' }
  }

  // 这里写入退款申请，真实交易需在此处接入微信退款 API 并等待异步回调。
  const refund = {
    status: 'refund_pending',
    refundStatus: 'pending',
    refundReason: reason || '用户申请退款',
    refundNote: note || '',
    refundAmount: Number(amount || order.payable),
    refundRequestedAt: Date.now()
  }
  const targetId = order._id || orderId
  await db.collection('orders').doc(targetId).update(refund)
  return { order: { ...order, ...refund } }
}
