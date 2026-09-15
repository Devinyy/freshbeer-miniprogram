<template>
  <view class="page">
    <fb-page-nav title="订单详情" />

    <scroll-view scroll-y class="content" v-if="order">
      <view class="status card">
        <view class="status__head">
          <text class="status__text">{{ statusText }}</text>
          <text class="status__track" v-if="order.status === 'delivering'" @tap="goTrack"
            >查看配送 ›</text
          >
        </view>
        <view class="timeline">
          <view class="tl" :class="{ done: idx <= step }" v-for="(s, idx) in steps" :key="idx">
            <view class="tl__dot"></view>
            <text class="tl__label">{{ s }}</text>
          </view>
        </view>
      </view>

      <view class="rider card" v-if="order.rider">
        <fb-icon class="rider__ico" name="truck" :size="24" />
        <view class="rider__body">
          <text class="rider__name">{{ order.rider.name }} · {{ order.rider.plate }}</text>
          <text class="rider__eta" v-if="order.status === 'delivering'"
            >预计 {{ eta }} 分钟送达</text
          >
        </view>
        <fb-icon class="rider__call" name="phone" :size="22" @tap="callRider" />
      </view>

      <!-- 缩略地图 -->
      <view class="map-card card" v-if="order.rider && (order.status === 'delivering' || order.status === 'preparing')" @tap="goTrack">
        <!-- #ifdef H5 -->
        <view class="map-card__fallback">
          <view class="map-card__road map-card__road--a"></view>
          <view class="map-card__road map-card__road--b"></view>
          <fb-icon class="map-card__fallback-pin" name="truck" :size="24" />
          <fb-icon class="map-card__fallback-home" name="location" :size="24" />
        </view>
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <map
          class="map-card__map"
          :latitude="mapLat"
          :longitude="mapLng"
          :markers="mapMarkers"
          :scale="14"
        ></map>
        <!-- #endif -->
        <view class="map-card__mask">
          <text class="map-card__text">查看实时配送轨迹 ›</text>
        </view>
      </view>

      <view class="addr card">
        <fb-icon class="addr__pin" name="location" :size="20" />
        <view class="addr__body">
          <view class="addr__line1"
            ><text class="addr__name">{{ order.address.name }}</text
            ><text class="addr__phone">{{ maskPhone(order.address.phone) }}</text></view
          >
          <view class="addr__detail">{{ order.address.detail }}</view>
        </view>
      </view>

      <view class="block card">
        <view class="block__title">商品清单</view>
        <view class="order-item" v-for="it in order.items" :key="it.productId">
          <view class="order-item__img"><fb-icon :name="emoji(it)" :size="34" color="#C87921" /></view>
          <view class="order-item__body">
            <view class="order-item__name ellipsis-1">{{ it.name }}</view>
            <view class="order-item__spec" v-if="it.spec">{{ it.spec }}</view>
            <view class="order-item__price num">¥{{ formatPrice(it.price * it.qty) }}</view>
          </view>
          <text class="order-item__qty">×{{ it.qty }}</text>
        </view>
        <view class="fee"><text>配送费</text><text class="num">¥{{ formatPrice(order.deliveryFee) }}</text></view>
        <view class="fee fee--total"
          ><text>实付</text><text class="num">¥{{ formatPrice(order.payable) }}</text></view
        >
      </view>

      <view class="block card">
        <view class="info-row"><text>订单编号</text><text class="num">{{ order.orderId }}</text></view>
        <view class="info-row"><text>下单时间</text><text>{{ formatTime(order.createdAt) }}</text></view>
        <view class="info-row"><text>配送方式</text><text>{{ deliveryText }}</text></view>
      </view>

      <view class="actions">
        <view class="act" @tap="reorder">再来一单</view>
        <view class="act act--primary" @tap="goTrack" v-if="order.status === 'delivering'">查看配送</view>
        <view class="act" @tap="goAfterSale" v-if="canRefund">申请售后</view>
        <view class="act" v-else-if="order.refundStatus === 'pending'">退款处理中</view>
      </view>

      <view style="height: 60rpx"></view>
    </scroll-view>

    <view class="empty" v-else>
      <text class="empty__text">订单不存在</text>
      <view class="empty__btn" @tap="goOrder">返回订单列表</view>
    </view>

    <fb-compliance-bar />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { getOrder, getRiderLocation } from '@/services/delivery'
import { useCartStore } from '@/store/cart'
import { formatPrice, formatTime, maskPhone } from '@/utils/format'

const cart = useCartStore()
const order = ref(null)
const eta = ref(0)
const steps = ['已下单', '已支付', '备货中', '配送中', '已送达']
let timer = null

const step = computed(() => {
  const map = { pending_pay: 0, preparing: 2, delivering: 3, done: 4, cancelled: -1 }
  return order.value ? (map[order.value.status] ?? 0) : 0
})
const mapLat = computed(() => (order.value && order.value.rider ? order.value.rider.lat : 31.18))
const mapLng = computed(() => (order.value && order.value.rider ? order.value.rider.lng : 121.43))
const mapMarkers = computed(() => {
  const m = []
  if (order.value && order.value.rider) {
    m.push({ id: 1, latitude: order.value.rider.lat, longitude: order.value.rider.lng, width: 30, height: 30 })
  }
  if (order.value && order.value.address && order.value.address.lat) {
    m.push({ id: 2, latitude: order.value.address.lat, longitude: order.value.address.lng, width: 26, height: 26 })
  }
  return m
})
const statusText = computed(() => {
  const map = {
    pending_pay: '待支付',
    preparing: '商家备货中',
    delivering: '骑手配送中',
    done: '已送达',
    cancelled: '已取消',
    refund_pending: '退款处理中',
    refunded: '已退款'
  }
  return order.value ? map[order.value.status] || '' : ''
})
const canRefund = computed(() =>
  order.value && ['preparing', 'delivering', 'done'].includes(order.value.status) && !order.value.refundStatus
)
const deliveryText = computed(() => {
  if (!order.value) return ''
  const map = { immediate: '立即配送', appoint: '预约配送', self: '到店自提' }
  return map[order.value.deliveryType] || '立即配送'
})

function emoji(it) {
  return it.categoryId === 'comp' ? 'warning' : 'beer'
}

onLoad((opts) => {
  load(opts.orderId)
})
async function load(orderId) {
  const res = await getOrder(orderId)
  order.value = res.order
  if (order.value && order.value.status === 'delivering') {
    startTimer()
  }
}
function startTimer() {
  timer = setInterval(async () => {
    if (!order.value) return
    const r = await getRiderLocation(order.value.orderId)
    if (r.rider) {
      eta.value = r.eta
      order.value.rider.lat = r.rider.lat
      order.value.rider.lng = r.rider.lng
    }
  }, 3000)
}
onUnload(() => {
  if (timer) clearInterval(timer)
})
function goTrack() {
  uni.navigateTo({ url: '/pages/delivery-tracking/delivery-tracking?orderId=' + order.value.orderId })
}
function callRider() {
  if (order.value && order.value.rider) {
    uni.makePhoneCall({ phoneNumber: order.value.rider.phone.replace(/\*/g, '') })
  }
}
function reorder() {
  if (!order.value) return
  order.value.items.forEach((it) => {
    cart.add({
      productId: it.productId,
      name: it.name,
      price: it.price,
      storagePrice: it.price,
      spec: it.spec || '',
      qty: it.qty,
      categoryId: it.categoryId || ''
    })
  })
  uni.showToast({ title: '已加入购物车', icon: 'success' })
  setTimeout(() => uni.switchTab({ url: '/pages/cart/cart' }), 700)
}
function goAfterSale() {
  if (!order.value) return
  uni.navigateTo({ url: '/pages/refund/refund?orderId=' + order.value.orderId })
}
function goOrder() {
  uni.redirectTo({ url: '/pages/order/order' })
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
  padding: 0 32rpx;
}
.nav__title {
  font-size: 34rpx;
  font-weight: 600;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 32rpx;
}
.card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 32rpx;
  box-shadow: var(--shadow-card);
  margin-bottom: 24rpx;
}
.status__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status__text {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.status__track {
  font-size: 26rpx;
  color: var(--color-primary);
}
.timeline {
  display: flex;
  margin-top: 32rpx;
}
.tl {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  color: var(--color-text-tertiary);
  font-size: 24rpx;
}
.tl__dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: var(--color-border);
  margin-bottom: 12rpx;
}
.tl.done {
  color: var(--color-primary);
}
.tl.done .tl__dot {
  background: var(--color-primary);
}
.rider {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.rider__ico {
  font-size: 56rpx;
}
.rider__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.rider__name {
  font-size: 30rpx;
  font-weight: 600;
}
.rider__eta {
  font-size: 24rpx;
  color: var(--color-cold-chain);
}
.rider__call {
  font-size: 44rpx;
}
.map-card {
  padding: 0;
  overflow: hidden;
  position: relative;
  height: 280rpx;
}
.map-card__map {
  width: 100%;
  height: 280rpx;
}
.map-card__fallback { width: 100%; height: 280rpx; position: absolute; inset: 0; overflow: hidden; background: #e8eee8; }
.map-card__road { position: absolute; height: 16rpx; width: 130%; left: -15%; background: #fff; box-shadow: 0 0 0 2rpx #d6dfd6; }
.map-card__road--a { top: 34%; transform: rotate(18deg); }
.map-card__road--b { top: 72%; transform: rotate(-14deg); }
.map-card__fallback-pin, .map-card__fallback-home { position: absolute; font-size: 44rpx; }
.map-card__fallback-pin { left: 28%; top: 42%; }
.map-card__fallback-home { right: 20%; bottom: 18%; }
.map-card__mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 24rpx;
  background: linear-gradient(180deg, rgba(255, 248, 240, 0), rgba(255, 248, 240, 0.9));
}
.map-card__text {
  font-size: 26rpx;
  color: var(--color-primary);
  font-weight: 600;
}
.addr {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.addr__pin {
  font-size: 40rpx;
}
.addr__body {
  flex: 1;
  min-width: 0;
}
.addr__line1 {
  display: flex;
  gap: 24rpx;
}
.addr__name {
  font-size: 30rpx;
  font-weight: 700;
}
.addr__phone {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}
.addr__detail {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  margin-top: 8rpx;
}
.block__title {
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
}
.order-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 16rpx 0;
}
.order-item__img {
  width: 88rpx;
  height: 88rpx;
  border-radius: var(--radius-image);
  background: var(--gradient-beer-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  flex-shrink: 0;
}
.order-item__body {
  flex: 1;
  min-width: 0;
}
.order-item__name {
  font-size: 28rpx;
}
.order-item__spec {
  font-size: 24rpx;
  color: var(--color-text-secondary);
}
.order-item__price {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 4rpx;
}
.order-item__qty {
  color: var(--color-text-secondary);
  font-size: 28rpx;
}
.fee {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  padding: 12rpx 0;
}
.fee--total {
  border-top: 2rpx solid var(--color-border-light);
  margin-top: 12rpx;
  padding-top: 24rpx;
  font-weight: 700;
}
.fee--total .num {
  color: var(--color-primary);
  font-size: 36rpx;
}
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: var(--color-text-secondary);
  padding: 12rpx 0;
}
.actions {
  display: flex;
  gap: 24rpx;
  margin-top: 8rpx;
}
.act {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  border: 2rpx solid var(--color-border);
  border-radius: var(--radius-button);
  font-size: 28rpx;
  color: var(--color-text-primary);
}
.act--primary {
  background: var(--gradient-primary-btn);
  color: #fff;
  border: none;
  box-shadow: var(--shadow-primary-glow);
}
.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
}
.empty__text {
  color: var(--color-text-secondary);
}
.empty__btn {
  background: var(--gradient-primary-btn);
  color: #fff;
  padding: 20rpx 56rpx;
  border-radius: var(--radius-pill);
  font-size: 30rpx;
}
</style>
