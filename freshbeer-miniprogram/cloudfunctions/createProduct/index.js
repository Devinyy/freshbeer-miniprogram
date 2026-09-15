'use strict'
exports.main = async (event) => {
  const db = uniCloud.database(); const user = (await db.collection('users').where({ openid: event.openid }).get()).data[0]
  if (!user || user.role !== 'admin') return { code: 403, msg: '无管理权限' }
  if (!event.name || Number(event.price) < 0 || Number(event.stock) < 0) return { code: 400, msg: '商品字段不合法' }
  const product = { name: String(event.name).trim(), category: event.category || 'beer', price: Number(event.price), stock: Number(event.stock), origin: event.origin || '', abv: event.abv || '', volume: event.volume || '', description: event.description || '', onSale: event.onSale !== false, createdAt: Date.now(), updatedAt: Date.now() }
  const id = await db.collection('products').add(product); return { product: { ...product, _id: id, id } }
}
