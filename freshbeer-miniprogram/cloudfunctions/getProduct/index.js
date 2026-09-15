'use strict'
// 云函数：获取单个商品详情

exports.main = async (event) => {
  const { id } = event
  const db = uniCloud.database()
  let product = await db.collection('products').doc(id).get()
  if (!product.data[0]) product = await db.collection('products').where({ id }).limit(1).get()
  return { product: product.data[0] || null }
}
