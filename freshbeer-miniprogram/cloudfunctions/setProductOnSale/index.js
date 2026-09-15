'use strict'
exports.main = async (event) => {
  const db = uniCloud.database(); const user = (await db.collection('users').where({ openid: event.openid }).get()).data[0]
  if (!user || user.role !== 'admin') return { code: 403, msg: '无管理权限' }
  await db.collection('products').doc(event.id).update({ onSale: !!event.onSale, updatedAt: Date.now() }); return { ok: true }
}
