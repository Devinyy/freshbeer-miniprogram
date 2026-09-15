'use strict'
exports.main = async (event) => {
  const db = uniCloud.database(); const users = db.collection('users')
  const user = (await users.where({ openid: event.openid }).get()).data[0]
  if (!user || user.role !== 'admin') return { code: 403, msg: '无管理权限' }
  const products = (await db.collection('products').get()).data.filter(p => !p.deletedAt)
  return { products }
}
