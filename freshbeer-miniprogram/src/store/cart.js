import { defineStore } from 'pinia'
import { loadPersisted, savePersisted } from '@/utils/persistence'

// 起送价（低于此金额不可结算）
export const MIN_ORDER_AMOUNT = 30

// 可用优惠券
export const COUPONS = [
  { id: 'c1', title: '新人满 99 减 15', threshold: 99, amount: 15 },
  { id: 'c2', title: '满 50 减 8', threshold: 50, amount: 8 },
  { id: 'c3', title: '满 30 减 3', threshold: 30, amount: 3 }
]

export const useCartStore = defineStore('cart', {
  state: () => ({
    // 每项: { key, productId, name, price, storagePrice, qty, spec, img, abv }
    items: [],
    couponId: 'c1'
  }),
  getters: {
    totalCount: (s) => s.items.reduce((a, b) => a + b.qty, 0),
    totalAmount: (s) => s.items.reduce((a, b) => a + b.price * b.qty, 0),
    totalStorageAmount: (s) =>
      s.items.reduce((a, b) => a + (b.storagePrice || b.price) * b.qty, 0),
    isEmpty: (s) => s.items.length === 0,
    coupon: (s) => COUPONS.find((c) => c.id === s.couponId) || null,
    couponDiscount() {
      const c = this.coupon
      if (!c) return 0
      return this.totalAmount >= c.threshold ? c.amount : 0
    },
    reachMinOrder() {
      return this.totalAmount >= MIN_ORDER_AMOUNT
    },
    minOrderGap() {
      return Math.max(0, MIN_ORDER_AMOUNT - this.totalAmount)
    }
  },
  actions: {
    hydrate() {
      const saved = loadPersisted(uni, 'freshbeer-cart', {})
      this.items = Array.isArray(saved.items) ? saved.items : []
      this.couponId = COUPONS.some((coupon) => coupon.id === saved.couponId) ? saved.couponId : 'c1'
    },
    persist() {
      savePersisted(uni, 'freshbeer-cart', { items: this.items, couponId: this.couponId })
    },
    setCoupon(id) {
      this.couponId = id
      this.persist()
    },
    add(item) {
      const key = item.productId + '_' + (item.spec || 'std')
      const exist = this.items.find((i) => i.key === key)
      const qty = item.qty || 1
      if (exist) {
        exist.qty += qty
      } else {
        this.items.push({ ...item, key, qty })
      }
      this.persist()
    },
    updateQty(key, qty) {
      const it = this.items.find((i) => i.key === key)
      if (!it) return
      if (qty <= 0) this.remove(key)
      else it.qty = qty
      if (qty > 0) this.persist()
    },
    remove(key) {
      this.items = this.items.filter((i) => i.key !== key)
      this.persist()
    },
    clear() {
      this.items = []
      this.persist()
    }
  }
})
