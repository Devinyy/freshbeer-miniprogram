'use strict'
// 使用 getPhoneNumber 返回的一次性 code 获取手机号，并在服务端映射管理员角色。
// 部署时在云函数环境变量中配置 WX_APPID、WX_SECRET、ADMIN_PHONE，切勿把管理员手机号写入前端。
exports.main = async (event) => {
  const { code, openid } = event
  if (!code || !openid) return { code: 400, msg: '缺少手机号授权参数' }
  const appid = process.env.WX_APPID
  const secret = process.env.WX_SECRET
  if (!appid || !secret) return { code: 500, msg: '未配置微信服务端凭据' }
  const tokenRes = await uniCloud.httpclient.request({ url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`, dataType: 'json' })
  const accessToken = tokenRes.data && tokenRes.data.access_token
  if (!accessToken) return { code: 500, msg: '获取微信访问令牌失败' }
  const phoneRes = await uniCloud.httpclient.request({ method: 'POST', url: `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`, contentType: 'json', data: { code }, dataType: 'json' })
  const phone = phoneRes.data && phoneRes.data.phone_info && phoneRes.data.phone_info.purePhoneNumber
  if (!phone) return { code: 400, msg: '获取手机号失败' }
  const db = uniCloud.database(); const users = db.collection('users')
  const found = await users.where({ openid }).get(); const role = phone === process.env.ADMIN_PHONE ? 'admin' : 'user'
  let user = found.data[0]
  if (user) { await users.doc(user._id).update({ phone, role, updatedAt: Date.now() }); user = { ...user, phone, role } }
  else { const id = await users.add({ openid, phone, role, nickname: '鲜啤用户', balance: 0, memberLevel: 0, createdAt: Date.now() }); user = { _id: id, openid, phone, role, nickname: '鲜啤用户', balance: 0, memberLevel: 0 } }
  return { token: `tk_${user._id}_${Date.now()}`, user: { id: user._id, openid, phone, role, nickname: user.nickname, balance: user.balance, memberLevel: user.memberLevel } }
}
