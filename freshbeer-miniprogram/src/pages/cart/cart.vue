<template>
  <view class="page">
    <view class="nav" :style="{ paddingTop: $statusBarHeight + 'px', height: 44 + $statusBarHeight + 'px' }">
      <text class="nav__title">购物车</text>
      <text v-if="cart.items.length" class="nav__clear" @tap="clearAll">清空</text>
    </view>

    <scroll-view scroll-y class="content" v-if="cart.items.length">
      <view class="coupon" @tap="chooseCoupon">
        <fb-icon class="coupon__ico" name="ticket" :size="18" />
        <view class="coupon__body">
          <text class="coupon__title">{{ couponText }}</text>
          <text class="coupon__sub">{{ couponSub }}</text>
        </view>
        <text class="coupon__arrow">切换 ›</text>
      </view>

      <view class="list">
        <view class="item" v-for="it in cart.items" :key="it.key">
          <view class="item__img" :style="imgStyle(it)"><fb-icon :name="emoji(it)" :size="34" color="#fff" /></view>
          <view class="item__body">
            <view class="item__name ellipsis-1">{{ it.name }}</view>
            <view class="item__spec" v-if="it.spec">规格：{{ it.spec }}</view>
            <view class="item__bottom">
              <text class="item__price num">¥{{ formatPrice(it.price) }}</text>
              <view class="stepper">
                <view class="stepper__btn" @tap="cart.updateQty(it.key, it.qty - 1)">－</view>
                <text class="stepper__num num">{{ it.qty }}</text>
                <view class="stepper__btn stepper__btn--add" @tap="cart.updateQty(it.key, it.qty + 1)">＋</view>
              </view>
            </view>
          </view>
          <fb-icon class="item__del" name="trash" :size="18" @tap="cart.remove(it.key)" />
        </view>
      </view>

      <!-- 凑单推荐 -->
      <view class="addon" v-if="addonList.length">
        <view class="addon__head">
          <text class="addon__title">再逛逛 · 凑单推荐</text>
          <text v-if="!cart.reachMinOrder" class="addon__tip">还差 ¥{{ formatPrice(cart.minOrderGap) }} 起送</text>
        </view>
        <scroll-view scroll-x class="addon__scroll" :show-scrollbar="false">
          <view class="addon__item" v-for="p in addonList" :key="p.id">
            <view class="addon__img" :style="imgStyleP(p)"><fb-icon :name="emojiP(p)" :size="28" color="#fff" /></view>
            <text class="addon__name ellipsis-1">{{ p.name }}</text>
            <view class="addon__bottom">
              <text class="addon__price num">¥{{ formatPrice(p.storagePrice || p.price) }}</text>
              <view class="addon__add" @tap="quickAdd(p)">＋</view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view style="height: 220rpx"></view>
    </scroll-view>

    <view class="empty" v-else>
      <fb-icon class="empty__icon" name="cart" :size="42" color="#8B7D6B" />
      <text class="empty__text">购物车还是空的</text>
      <view class="empty__btn" @tap="goHome">去逛逛</view>
      <view style="height: 240rpx"></view>
    </view>

    <view class="compliance-fixed" v-if="cart.items.length"><fb-compliance-bar /></view>

    <view class="footbar" v-if="cart.items.length">
      <view class="footbar__left">
        <view class="footbar__price-row">
          <text class="footbar__total num">¥{{ formatPrice(payable) }}</text>
          <text v-if="cart.couponDiscount" class="footbar__cut num">已省 ¥{{ formatPrice(cart.couponDiscount) }}</text>
        </view>
        <text class="footbar__tip">另需配送费 ¥{{ formatPrice(deliveryFee) }} · 起送 ¥{{ MIN_ORDER_AMOUNT }}</text>
      </view>
      <view
        class="footbar__btn"
        :class="{ 'footbar__btn--disabled': !cart.reachMinOrder }"
        @tap="goCheckout"
      >{{ cart.reachMinOrder ? '去结算（' + cart.totalCount + '）' : '差 ¥' + formatPrice(cart.minOrderGap) + ' 起送' }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCartStore, COUPONS, MIN_ORDER_AMOUNT } from '@/store/cart'
import { getProducts } from '@/services/product'
import { formatPrice } from '@/utils/format'
import { syncCustomTabBar } from '@/utils/tabbar'

const cart = useCartStore()
const deliveryFee = ref(5)
const allProducts = ref([])

onMounted(async () => {
  const res = await getProducts()
  allProducts.value = res.products || []
})
onShow(() => syncCustomTabBar('pages/cart/cart'))

const payable = computed(() =>
  Math.max(0, cart.totalAmount + deliveryFee.value - cart.couponDiscount)
)
const couponText = computed(() => {
  const c = cart.coupon
  if (!c) return '未使用优惠券'
  return cart.couponDiscount ? `${c.title} · 已抵 ¥${c.amount}` : c.title
})
const couponSub = computed(() => {
  const c = cart.coupon
  if (!c) return '点击选择可用券'
  if (cart.couponDiscount) return '已生效'
  return `再购 ¥${formatPrice(c.threshold - cart.totalAmount)} 可用`
})
const addonList = computed(() => {
  const inCart = new Set(cart.items.map((i) => i.productId))
  return allProducts.value
    .filter((p) => !inCart.has(p.id) && p.stock > 0 && (!p.specGroups || !p.specGroups.length))
    .sort((a, b) => (a.storagePrice || a.price) - (b.storagePrice || b.price))
    .slice(0, 6)
})

function emoji(it) {
  return it.categoryId === 'comp' ? 'warning' : 'beer'
}
function emojiP(p) {
  return p.categoryId === 'comp' ? 'warning' : 'beer'
}
function imgStyle(it) {
  return bg(it.categoryId)
}
function imgStyleP(p) {
  return bg(p.categoryId)
}
function bg(c) {
  if (c === 'whisky') return 'background:linear-gradient(135deg,#6B4423,#3D2817);'
  if (c === 'soft') return 'background:linear-gradient(135deg,#A8D5BA,#4CAF50);'
  if (c === 'comp') return 'background:linear-gradient(135deg,#FFB3A7,#F44336);'
  return 'background:var(--gradient-beer-glass);'
}
function quickAdd(p) {
  cart.add({
    productId: p.id,
    name: p.name,
    price: p.storagePrice || p.price,
    storagePrice: p.storagePrice,
    spec: '',
    qty: 1,
    categoryId: p.categoryId
  })
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}
function chooseCoupon() {
  const usable = COUPONS.map((c) => {
    const ok = cart.totalAmount >= c.threshold
    return `${c.title}${ok ? '（可用）' : '（未满门槛）'}`
  })
  uni.showActionSheet({
    itemList: [...usable, '不使用优惠券'],
    success: (r) => {
      if (r.tapIndex < COUPONS.length) cart.setCoupon(COUPONS[r.tapIndex].id)
      else cart.setCoupon('')
    }
  })
}
function clearAll() {
  uni.showModal({
    title: '清空购物车',
    content: '确定清空所有商品？',
    success: (r) => {
      if (r.confirm) cart.clear()
    }
  })
}
function goCheckout() {
  if (!cart.reachMinOrder) {
    uni.showToast({ title: `还差 ¥${formatPrice(cart.minOrderGap)} 起送`, icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/order-confirm/order-confirm' })
}
function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
}
.nav {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
}
.nav__title {
  font-size: 34rpx;
  font-weight: 600;
}
.nav__clear {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}
.content {
  flex: 1;
  overflow-y: auto;
}
.coupon {
  margin: 24rpx 32rpx;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #fff0d6, #ffe0b3);
  border-radius: var(--radius-button);
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.coupon__ico {
  font-size: 44rpx;
}
.coupon__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.coupon__title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--color-secondary-dark);
}
.coupon__sub {
  font-size: 22rpx;
  color: var(--color-secondary-brown);
  margin-top: 4rpx;
}
.coupon__arrow {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 26rpx;
}
.list {
  margin: 0 32rpx;
}
.item {
  display: flex;
  gap: 24rpx;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 24rpx;
  box-shadow: var(--shadow-card);
  margin-bottom: 24rpx;
  position: relative;
}
.item__img {
  width: 128rpx;
  height: 128rpx;
  border-radius: var(--radius-image);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  flex-shrink: 0;
}
.item__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.item__name {
  font-size: 30rpx;
  font-weight: 500;
}
.item__spec {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  margin-top: 4rpx;
}
.item__bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item__price {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 32rpx;
}
.item__del {
  font-size: 32rpx;
  color: var(--color-text-tertiary);
  padding: 8rpx;
}
.stepper {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.stepper__btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 2rpx solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: var(--color-text-secondary);
}
.stepper__btn--add {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
.stepper__num {
  font-size: 30rpx;
  min-width: 40rpx;
  text-align: center;
}
.addon {
  margin: 8rpx 32rpx 0;
}
.addon__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.addon__title {
  font-size: 28rpx;
  font-weight: 700;
}
.addon__tip {
  font-size: 24rpx;
  color: var(--color-warning);
}
.addon__scroll {
  white-space: nowrap;
}
.addon__item {
  display: inline-flex;
  flex-direction: column;
  width: 192rpx;
  margin-right: 20rpx;
  vertical-align: top;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 16rpx;
  box-shadow: var(--shadow-card);
}
.addon__img {
  width: 160rpx;
  height: 160rpx;
  border-radius: var(--radius-image);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 68rpx;
}
.addon__name {
  font-size: 24rpx;
  margin-top: 12rpx;
}
.addon__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}
.addon__price {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.addon__add {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.empty__icon {
  font-size: 128rpx;
  opacity: 0.4;
}
.empty__text {
  margin-top: 24rpx;
  color: var(--color-text-secondary);
  font-size: 28rpx;
}
.empty__btn {
  margin-top: 40rpx;
  background: var(--gradient-primary-btn);
  color: #fff;
  padding: 20rpx 64rpx;
  border-radius: var(--radius-pill);
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: var(--shadow-primary-glow);
}
.compliance-fixed {
  position: fixed;
  bottom: calc(112rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  background: var(--color-bg);
  z-index: 10;
}
.footbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(112rpx + env(safe-area-inset-bottom));
  height: 112rpx;
  background: var(--color-surface);
  border-top: 2rpx solid var(--color-border-light);
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  gap: 24rpx;
  z-index: 20;
}
.footbar__left {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.footbar__price-row {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}
.footbar__total {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.footbar__cut {
  font-size: 22rpx;
  color: var(--color-flash-sale);
}
.footbar__tip {
  font-size: 22rpx;
  color: var(--color-text-tertiary);
}
.footbar__btn {
  background: var(--gradient-primary-btn);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  padding: 0 56rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-primary-glow);
}
.footbar__btn--disabled {
  background: var(--color-primary-disabled);
  box-shadow: none;
  color: #fff;
}
</style>
