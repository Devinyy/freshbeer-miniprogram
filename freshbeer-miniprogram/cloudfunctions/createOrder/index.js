'use strict'
// 云函数：创建订单
// 校验库存、计算费用、写入 orders 集合。返回 order 供前端拉起支付。

exports.main = async (event) => {
  const { items, address, deliveryType, deliveryTime, discount, couponId, openid } = event
  const db = uniCloud.database()

  // 简单库存校验示例
  const productRows = []
  for (const it of items) {
    let p = await db.collection('products').doc(it.productId).get()
    if (!p.data[0]) p = await db.collection('products').where({ id: it.productId }).limit(1).get()
    const stock = p.data[0] ? p.data[0].stock : 0
    if (stock < it.qty) {
      return { code: -2, msg: '商品库存不足：' + (p.data[0] && p.data[0].name) }
    }
    productRows.push(p.data[0])
  }

  const goodsAmount = items.reduce((a, b) => a + b.price * b.qty, 0)
  const deliveryFee = 5
  const payable = Math.max(0, goodsAmount + deliveryFee - (discount || 0))

  const order = {
    orderId: 'FB' + Date.now().toString().slice(-10),
    status: 'pending_pay',
    items,
    address,
    deliveryType: deliveryType || 'immediate',
    deliveryTime: deliveryTime || '',
    couponId: couponId || '',
    goodsAmount,
    deliveryFee,
    discount: discount || 0,
    payable,
    openid: openid || '',
    createdAt: Date.now()
  }
  await db.collection('orders').add(order)

  // 扣减库存（锁库存）
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    const product = productRows[i]
    await db.collection('products').doc(product._id || it.productId).update({
      stock: db.command.inc(-it.qty)
    })
  }

  return { order }
}
