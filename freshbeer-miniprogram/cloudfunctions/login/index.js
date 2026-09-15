'use strict'
// 云函数：微信登录
// 通过 wx.login 获取的 code 向微信换取 openid，查询/创建用户，返回 token 与用户信息。
// 部署前请替换 YOUR_WX_APPID / YOUR_WX_SECRET（建议放到 uniCloud 环境配置或云函数环境变量）。

exports.main = async (event) => {
  const { code } = event
  const appid = process.env.WX_APPID || 'YOUR_WX_APPID'
  const secret = process.env.WX_SECRET || 'YOUR_WX_SECRET'

  const res = await uniCloud.httpclient.request({
    url:
      'https://api.weixin.qq.com/sns/jscode2session?appid=' +
      appid +
      '&secret=' +
      secret +
      '&js_code=' +
      code +
      '&grant_type=authorization_code',
    dataType: 'json'
  })

  if (!res.data || !res.data.openid) {
    return { code: -1, msg: '登录失败：' + (res.data && res.data.errmsg) }
  }
  const openid = res.data.openid

  const db = uniCloud.database()
  const coll = db.collection('users')
  let user = await coll.where({ openid }).get()

  if (!user.data.length) {
    const newUser = {
      openid,
      nickname: '鲜啤用户',
      createdAt: Date.now(),
      balance: 0,
      memberLevel: 0,
      realnameVerified: false,
      role: 'user'
    }
    const id = await coll.add(newUser)
    newUser._id = id
    user = { data: [newUser] }
  }

  const u = user.data[0]
  return {
    token: 'tk_' + u._id + '_' + Date.now(),
    user: { id: u._id, openid, nickname: u.nickname, phone: u.phone || '', role: u.role || 'user', balance: u.balance, memberLevel: u.memberLevel }
  }
}
