'use strict'
// 云函数：获取订单列表（按用户 / 状态）

exports.main = async (event) => {
  const { userId, status } = event
  const db = uniCloud.database()
  let query = db.collection('orders')
  if (userId) query = query.where({ openid: userId })
  if (status) query = query.where({ status })
  const orders = await query.orderBy('createdAt', 'desc').get()
  return { orders: orders.data }
}
