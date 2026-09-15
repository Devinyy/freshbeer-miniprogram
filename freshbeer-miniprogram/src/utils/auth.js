/**
 * 微信登录 / 认证封装
 * 优先走 uniCloud 云函数 login，未配置环境时走 mock。
 */
import { callCloud } from './request'

export async function wechatLogin() {
  // #ifdef MP-WEIXIN
  const { code } = await uni.login()
  const res = await callCloud('login', { code })
  if (res && res.token) {
    uni.setStorageSync('token', res.token)
    uni.setStorageSync('user', res.user)
  }
  return res && res.user
  // #endif

  // #ifndef MP-WEIXIN
  // H5 / 调试：直接拿 mock 用户
  const res = await callCloud('login', { code: 'mock-code' })
  uni.setStorageSync('token', res.token)
  uni.setStorageSync('user', res.user)
  return res.user
  // #endif
}

export function getToken() {
  return uni.getStorageSync('token') || ''
}

export function getCurrentUser() {
  return uni.getStorageSync('user') || null
}

/** 微信获取手机号（需 button open-type="getPhoneNumber"） */
export async function getPhoneNumber(e) {
  if (!e.detail || !e.detail.code) return null
  const current = await wechatLogin()
  if (!current || !current.openid) throw new Error('请先完成微信登录')
  const res = await callCloud('decryptPhone', { code: e.detail.code, openid: current.openid })
  if (res && res.token) uni.setStorageSync('token', res.token)
  if (res && res.user) uni.setStorageSync('user', res.user)
  return res && res.user
}
