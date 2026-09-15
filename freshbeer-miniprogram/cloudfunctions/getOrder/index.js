'use strict'

exports.main = async (event) => {
  const { orderId, openid } = event
  const db = uniCloud.database()
  let result = await db.collection('orders').doc(orderId).get()
  let order = result.data[0]
  if (!order) {
    const where = { orderId }
    if (openid) where.openid = openid
    result = await db.collection('orders').where(where).limit(1).get()
    order = result.data[0]
  }
  return { order: order || null }
}
