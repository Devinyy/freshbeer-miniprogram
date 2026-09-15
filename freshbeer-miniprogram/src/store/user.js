import { defineStore } from 'pinia'
import { wechatLogin, getPhoneNumber } from '@/utils/auth'
import { loadPersisted, savePersisted } from '@/utils/persistence'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
    profile: null,
    realnameVerified: false,
    realnameInfo: null,
    isMember: false,
    balance: 0,
    memberLevel: 0,
    addresses: []
  }),
  getters: {
    defaultAddress: (s) => s.addresses.find((a) => a.isDefault) || s.addresses[0] || null,
    isAdmin: (s) => s.profile && s.profile.role === 'admin'
  },
  actions: {
    hydrate() {
      const saved = loadPersisted(uni, 'freshbeer-user', {})
      this.isLogin = !!saved.isLogin
      this.profile = saved.profile || null
      this.balance = Number(saved.balance || 0)
      this.memberLevel = Number(saved.memberLevel || 0)
      this.isMember = this.memberLevel > 0
      this.addresses = Array.isArray(saved.addresses) ? saved.addresses : []
    },
    persist() {
      savePersisted(uni, 'freshbeer-user', {
        isLogin: this.isLogin,
        profile: this.profile,
        balance: this.balance,
        memberLevel: this.memberLevel,
        addresses: this.addresses
      })
    },
    async login() {
      const user = await wechatLogin()
      if (!user) throw new Error('微信登录失败')
      this.profile = user
      this.isLogin = true
      this.balance = Number(user.balance || this.balance || 0)
      this.memberLevel = Number(user.memberLevel || this.memberLevel || 0)
      this.isMember = this.memberLevel > 0
      this.persist()
      return user
    },
    async ensureLogin() {
      if (this.isLogin && this.profile && this.profile.openid) return this.profile
      return this.login()
    },
    async loginWithPhone(e) {
      const user = await getPhoneNumber(e)
      if (!user) throw new Error('未授权手机号')
      this.profile = user
      this.isLogin = true
      this.balance = Number(user.balance || this.balance || 0)
      this.memberLevel = Number(user.memberLevel || this.memberLevel || 0)
      this.isMember = this.memberLevel > 0
      this.persist()
      return user
    },
    setRealname(info) {
      this.realnameVerified = true
      this.realnameInfo = info
    },
    setBalance(v) {
      this.balance = v
      this.persist()
    },
    setMember(level) {
      this.isMember = level > 0
      this.memberLevel = level
      this.persist()
    },
    addAddress(a) {
      if (a.isDefault) this.addresses.forEach((x) => (x.isDefault = false))
      this.addresses.push(a)
      this.persist()
    },
    updateAddress(id, patch) {
      const idx = this.addresses.findIndex((a) => a.id === id)
      if (idx >= 0) this.addresses[idx] = { ...this.addresses[idx], ...patch }
      this.persist()
    },
    setDefaultAddress(id) {
      this.addresses.forEach((a) => (a.isDefault = a.id === id))
      this.persist()
    },
    removeAddress(id) {
      this.addresses = this.addresses.filter((a) => a.id !== id)
      this.persist()
    }
  }
})
