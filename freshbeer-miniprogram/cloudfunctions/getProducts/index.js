'use strict'
// 云函数：获取商品分类与列表
// 真实部署时从 products / categories 集合读取；结构与前端 mock 保持一致。

exports.main = async (event) => {
  const db = uniCloud.database()
  const cats = await db.collection('categories').orderBy('sort', 'asc').get()
  const prods = await db.collection('products').where({ onSale: true }).get()
  return {
    categories: cats.data,
    products: prods.data
  }
}
