'use strict'
// 云函数：获取骑手实时位置（模拟配送追踪）
// 真实场景：骑手端 App 定时上报 GPS -> 本函数返回最新坐标与 ETA。
// 演示用：在订单初始骑手坐标附近做小范围随机偏移，模拟实时移动。

exports.main = async (event) => {
  const { orderId } = event
  const db = uniCloud.database()
  const order = await db.collection('orders').doc(orderId).get()
  const o = order.data[0]
  if (!o || !o.rider) return { rider: null, eta: 0 }

  const base = o.rider
  const lat = Number((base.lat + (Math.random() - 0.5) * 0.002).toFixed(6))
  const lng = Number((base.lng + (Math.random() - 0.5) * 0.002).toFixed(6))
  const eta = Math.floor(8 + Math.random() * 6)

  // 可选：把最新位置写回订单
  await db.collection('orders').doc(orderId).update({
    rider: { ...base, lat, lng }
  })

  return {
    rider: { ...base, lat, lng },
    eta
  }
}
