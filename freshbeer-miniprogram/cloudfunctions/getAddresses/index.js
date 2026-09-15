'use strict'
// 云函数：获取用户收货地址列表

exports.main = async (event) => {
  const { userId } = event
  const db = uniCloud.database()
  // 演示：返回全部地址；真实场景按 userId 过滤
  const addresses = await db.collection('addresses').get()
  return { addresses: addresses.data }
}
