<template>
  <view class="page">
    <view class="nav" :style="{ paddingTop: $statusBarHeight + 'px', height: 44 + $statusBarHeight + 'px' }"><text class="nav__title">我的订单</text></view>

    <view class="tabs">
      <view
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ on: active === t.key }"
        @tap="active = t.key"
        >{{ t.label }}</view
      >
    </view>

    <scroll-view scroll-y class="content">
      <view class="order" v-for="o in filtered" :key="o.orderId" @tap="goDetail(o)">
        <view class="order__top">
          <text class="order__id num">#{{ o.orderId }}</text>
          <text class="order__status" :class="'st-' + o.status">{{ statusText(o.status) }}</text>
        </view>
        <view class="order__items">
          <view class="order__item" v-for="(it, i) in o.items" :key="i">
            <view class="order__img">{{ emoji }}</view>
            <view class="order__info">
              <text class="order__name ellipsis-1">{{ it.name }}</text>
              <text class="order__spec" v-if="it.spec">规格：{{ it.spec }}</text>
            </view>
            <text class="order__qty num">×{{ it.qty }}</text>
          </view>
        </view>
        <view class="order__bottom">
          <text class="order__time num">{{ formatTime(o.createdAt) }}</text>
          <text class="order__amount"
            >合计 <text class="num">¥{{ formatPrice(o.payable) }}</text></text
          >
        </view>
      </view>

      <view class="empty" v-if="loaded && !filtered.length">
        <fb-icon class="empty__icon" name="package" :size="42" color="#8B7D6B" />
        <text class="empty__text">还没有相关订单</text>
        <view class="empty__btn" @tap="goHome">去逛逛</view>
      </view>
      <view class="empty" v-if="!loaded">
        <text class="empty__text">加载中…</text>
      </view>
      <view style="height: 80rpx"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getOrderList } from '@/services/delivery'
import { formatPrice, formatTime } from '@/utils/format'
import { syncCustomTabBar } from '@/utils/tabbar'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending_pay', label: '待支付' },
  { key: 'delivering', label: '配送中' },
  { key: 'done', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
]
const active = ref('all')
const orders = ref([])
const loaded = ref(false)

const filtered = computed(() => {
  if (active.value === 'all') return orders.value
  if (active.value === 'delivering')
    return orders.value.filter((o) => o.status === 'preparing' || o.status === 'delivering')
  return orders.value.filter((o) => o.status === active.value)
})

function statusText(s) {
  return (
    {
      pending_pay: '待支付',
      preparing: '备货中',
      delivering: '配送中',
      done: '已完成',
      cancelled: '已取消',
      refund_pending: '退款处理中',
      refunded: '已退款'
    }[s] || s
  )
}
const emoji = 'beer'
async function load() {
  const res = await getOrderList()
  orders.value = res.orders || []
  loaded.value = true
}
function goDetail(o) {
  uni.navigateTo({ url: '/pages/order-detail/order-detail?orderId=' + o.orderId })
}
function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}
onShow(() => {
  syncCustomTabBar('pages/order/order')
  load()
})
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
  padding: 0 32rpx;
}
.nav__title {
  font-size: 34rpx;
  font-weight: 600;
}
.tabs {
  display: flex;
  background: var(--color-surface);
  border-bottom: 2rpx solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: 5;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 26rpx;
  color: var(--color-text-secondary);
  position: relative;
}
.tab.on {
  color: var(--color-primary);
  font-weight: 700;
}
.tab.on::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  border-radius: 4rpx;
  background: var(--color-primary);
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}
.order {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 28rpx;
  box-shadow: var(--shadow-card);
  margin-bottom: 24rpx;
}
.order__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid var(--color-border-light);
}
.order__id {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}
.order__status {
  font-size: 26rpx;
  font-weight: 600;
}
.st-pending_pay {
  color: var(--color-warning);
}
.st-preparing {
  color: var(--color-info);
}
.st-delivering {
  color: var(--color-cold-chain);
}
.st-done {
  color: var(--color-success);
}
.st-cancelled {
  color: var(--color-text-tertiary);
}
.order__items {
  padding: 20rpx 0;
}
.order__item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 12rpx 0;
}
.order__img {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--radius-image);
  background: var(--gradient-beer-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}
.order__info {
  flex: 1;
  min-width: 0;
}
.order__name {
  font-size: 28rpx;
  font-weight: 500;
}
.order__spec {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  margin-top: 4rpx;
}
.order__qty {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}
.order__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 2rpx solid var(--color-border-light);
}
.order__time {
  font-size: 24rpx;
  color: var(--color-text-tertiary);
}
.order__amount {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}
.order__amount .num {
  color: var(--color-primary);
  font-size: 32rpx;
  font-weight: 700;
}
.empty {
  text-align: center;
  padding: 120rpx 0;
}
.empty__icon {
  font-size: 112rpx;
  opacity: 0.4;
}
.empty__text {
  display: block;
  margin-top: 24rpx;
  color: var(--color-text-secondary);
  font-size: 28rpx;
}
.empty__btn {
  display: inline-block;
  margin-top: 40rpx;
  background: var(--gradient-primary-btn);
  color: #fff;
  padding: 20rpx 64rpx;
  border-radius: var(--radius-pill);
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: var(--shadow-primary-glow);
}
</style>
