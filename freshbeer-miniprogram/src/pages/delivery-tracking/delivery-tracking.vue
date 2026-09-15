<template>
  <view class="page">
    <!-- #ifdef H5 -->
    <view class="map-fallback">
      <view class="map-fallback__road map-fallback__road--a"></view>
      <view class="map-fallback__road map-fallback__road--b"></view>
      <view class="map-fallback__route"></view>
      <view class="map-fallback__rider"><fb-icon name="truck" :size="28" /></view>
      <view class="map-fallback__home"><fb-icon name="location" :size="28" /></view>
    </view>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <map
      class="map"
      :latitude="centerLat"
      :longitude="centerLng"
      :markers="markers"
      :show-location="true"
      v-if="order"
    ></map>
    <!-- #endif -->

    <view class="topbar" :style="{ paddingTop: $statusBarHeight + 'px', height: 44 + $statusBarHeight + 'px' }">
      <text class="topbar__back" @tap="goBack">‹</text>
      <text class="topbar__title">配送追踪</text>
    </view>

    <view class="panel" v-if="order">
      <view class="panel__eta">
        <text class="panel__eta-num num">{{ eta }}</text>
        <text class="panel__eta-unit">分钟</text>
        <text class="panel__eta-tip">后送达 · 冷链保鲜中 ❄</text>
      </view>

      <view class="rider">
        <fb-icon class="rider__ico" name="truck" :size="24" />
        <view class="rider__body">
          <text class="rider__name" v-if="order.rider">{{ order.rider.name }} · {{ order.rider.plate }}</text>
          <text class="rider__sub">正在火速赶来，请保持电话畅通</text>
        </view>
        <fb-icon class="rider__call" name="phone" :size="22" @tap="callRider" />
      </view>

      <view class="panel__addr">
        <fb-icon class="panel__addr-pin" name="location" :size="20" />
        <text class="panel__addr-text">{{ addressText }}</text>
      </view>

      <view class="panel__cold">鲜啤全程冷链 · 签收请验货温度</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { getOrder, getRiderLocation } from '@/services/delivery'

const order = ref(null)
const eta = ref(0)
const riderLat = ref(31.18)
const riderLng = ref(121.43)
let timer = null

const centerLat = computed(() => riderLat.value)
const centerLng = computed(() => riderLng.value)
const addressText = computed(() => (order.value && order.value.address ? order.value.address.detail : ''))

const markers = computed(() => {
  const m = []
  if (order.value && order.value.rider) {
    m.push({
      id: 1,
      latitude: riderLat.value,
      longitude: riderLng.value,
      width: 32,
      height: 32,
      callout: { content: '骑手', color: '#fff', bgColor: '#F5A623', padding: 6, display: 'ALWAYS' }
    })
  }
  if (order.value && order.value.address && order.value.address.lat) {
    m.push({
      id: 2,
      latitude: order.value.address.lat,
      longitude: order.value.address.lng,
      width: 28,
      height: 28,
      callout: { content: '收货地址', color: '#fff', bgColor: '#2C1810', padding: 6, display: 'ALWAYS' }
    })
  }
  return m
})

onLoad((opts) => {
  load(opts.orderId)
})
async function load(orderId) {
  const res = await getOrder(orderId)
  order.value = res.order
  if (order.value && order.value.rider) {
    riderLat.value = order.value.rider.lat
    riderLng.value = order.value.rider.lng
    startTimer(orderId)
  }
}
function startTimer(orderId) {
  timer = setInterval(async () => {
    const r = await getRiderLocation(orderId)
    if (r.rider) {
      riderLat.value = r.rider.lat
      riderLng.value = r.rider.lng
      eta.value = r.eta
    }
  }, 3000)
}
onUnload(() => {
  if (timer) clearInterval(timer)
})
function callRider() {
  if (order.value && order.value.rider) {
    uni.makePhoneCall({ phoneNumber: order.value.rider.phone.replace(/\*/g, '') })
  }
}
function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
  height: 100vh;
  background: var(--color-bg);
}
.map {
  position: absolute;
  inset: 0;
}
.map-fallback { position: absolute; inset: 0; overflow: hidden; background: #e8eee8; }
.map-fallback__road { position: absolute; height: 10px; background: #fff; box-shadow: 0 0 0 1px #d6dfd6; }
.map-fallback__road--a { width: 130%; left: -15%; top: 28%; transform: rotate(22deg); }
.map-fallback__road--b { width: 130%; left: -15%; top: 70%; transform: rotate(-18deg); }
.map-fallback__route { position: absolute; left: 18%; top: 30%; width: 58%; height: 42%; border: 4px solid var(--color-primary); border-left-color: transparent; border-bottom-color: transparent; border-radius: 50%; transform: rotate(12deg); opacity: .8; }
.map-fallback__rider, .map-fallback__home { position: absolute; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #fff; box-shadow: var(--shadow-raised); font-size: 24px; }
.map-fallback__rider { left: 24%; top: 35%; }
.map-fallback__home { right: 20%; bottom: 28%; }
.topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding-top: env(safe-area-inset-top);
  height: calc(44px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  padding-left: 12px;
  background: linear-gradient(180deg, rgba(255, 248, 240, 0.95), rgba(255, 248, 240, 0));
  z-index: 10;
}
.topbar__back {
  font-size: 28px;
  color: var(--color-text-primary);
  width: 32px;
}
.topbar__title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  margin-right: 32px;
}
.panel {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: calc(20px + env(safe-area-inset-bottom));
  background: var(--color-surface);
  border-radius: var(--radius-sheet);
  padding: 20px;
  box-shadow: var(--shadow-floating);
  z-index: 10;
}
.panel__eta {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.panel__eta-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
}
.panel__eta-unit {
  font-size: 14px;
  color: var(--color-text-primary);
}
.panel__eta-tip {
  font-size: 13px;
  color: var(--color-cold-chain);
  margin-left: 8px;
}
.rider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
}
.rider__ico {
  font-size: 28px;
}
.rider__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.rider__name {
  font-size: 15px;
  font-weight: 600;
}
.rider__sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.rider__call {
  font-size: 22px;
  background: var(--color-primary-light);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel__addr {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.panel__cold {
  margin-top: 12px;
  font-size: 12px;
  color: var(--color-cold-chain);
  background: var(--color-cold-chain-bg);
  padding: 8px 12px;
  border-radius: var(--radius-input);
}
</style>
