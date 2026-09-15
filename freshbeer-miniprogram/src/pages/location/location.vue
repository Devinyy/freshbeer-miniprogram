<template>
  <view class="page">
    <view class="map-wrap">
      <!-- #ifdef H5 -->
      <view class="map-fallback">
        <view class="map-fallback__road map-fallback__road--a"></view>
        <view class="map-fallback__road map-fallback__road--b"></view>
        <view class="map-fallback__pin"><fb-icon name="location" :size="30" color="#C87921" /></view>
        <text class="map-fallback__label">配送范围 3km</text>
      </view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <map
        class="map"
        :latitude="center.lat"
        :longitude="center.lng"
        :markers="markers"
        :circles="circles"
        :scale="13"
        show-location
      ></map>
      <!-- #endif -->
      <view class="topbar" :style="{ paddingTop: statusBarH + 'px' }">
        <text class="topbar__back" @tap="goBack">‹</text>
        <text class="topbar__title">选择收货位置</text>
      </view>
      <view class="locate-btn" @tap="relocate">
        <fb-icon class="locate-btn__ico" name="target" :size="18" />
      </view>
    </view>

    <view class="sheet">
      <view class="current" @tap="useCurrent">
        <fb-icon class="current__ico" name="location" :size="18" />
        <view class="current__body">
          <text class="current__label">当前定位</text>
          <text class="current__addr">{{ currentAddr }}</text>
        </view>
        <text class="current__use">使用</text>
      </view>

      <view class="range" :class="{ 'range--out': !inRange }">
        <text class="range__ico">{{ inRange ? '✅' : '⚠️' }}</text>
        <text class="range__text">{{
          inRange ? '当前位置在配送范围内（门店 3km 内，约 15-30 分钟达）' : '当前位置超出配送范围，请切换地址'
        }}</text>
      </view>

      <view class="search" @tap="doSearch">
        <fb-icon class="search__ico" name="search" :size="18" />
        <text class="search__ph">搜索小区 / 写字楼 / 街道</text>
      </view>

      <view class="section-title">附近地址</view>
      <scroll-view scroll-y class="poi-list">
        <view
          class="poi"
          v-for="(p, i) in pois"
          :key="i"
          :class="{ 'poi--active': i === picked }"
          @tap="pick(i)"
        >
          <view class="poi__body">
            <text class="poi__name">{{ p.name }}</text>
            <text class="poi__addr">{{ p.addr }}</text>
          </view>
          <text class="poi__dist num">{{ p.dist }}</text>
          <text v-if="i === picked" class="poi__check">✓</text>
        </view>
      </scroll-view>

      <view class="confirm" @tap="confirm">确认地址</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { isWithinDeliveryRange } from '@/utils/location'

const user = useUserStore()
const systemInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
const statusBarH = ref(systemInfo.statusBarHeight || 0)
const picked = ref(0)
const inRange = ref(true)
const center = ref({ lat: 31.186, lng: 121.443 })

const currentAddr = ref('上海市徐汇区漕溪北路 100 号')
const pois = ref([
  { name: '阳光公寓', addr: '徐汇区漕溪北路 100 号', dist: '80m', lat: 31.186, lng: 121.443 },
  { name: '环球中心写字楼', addr: '徐汇区虹桥路 3 号 15 楼', dist: '420m', lat: 31.19, lng: 121.44 },
  { name: '田林新村', addr: '徐汇区田林路 88 弄', dist: '1.2km', lat: 31.18, lng: 121.42 },
  { name: '漕河泾开发区', addr: '徐汇区桂平路 391 号', dist: '2.6km', lat: 31.17, lng: 121.4 }
])

const markers = computed(() => [
  {
    id: 1,
    latitude: center.value.lat,
    longitude: center.value.lng,
    width: 32,
    height: 32,
    callout: { content: '收货位置', color: '#fff', bgColor: '#F5A623', padding: 6, display: 'ALWAYS' }
  }
])
const circles = computed(() => [
  {
    latitude: 31.186,
    longitude: 121.443,
    radius: 3000,
    color: '#F5A62366',
    fillColor: '#F5A62322',
    strokeWidth: 1
  }
])

function relocate() {
  uni.getLocation({
    type: 'gcj02',
    success: (location) => {
      center.value = { lat: location.latitude, lng: location.longitude }
      currentAddr.value = '当前位置（定位成功）'
      inRange.value = isWithinDeliveryRange({ lat: 31.186, lng: 121.443 }, center.value, 3000)
      picked.value = -1
      uni.showToast({ title: inRange.value ? '已定位到当前位置' : '当前位置超出配送范围', icon: 'none' })
    },
    fail: () => {
      uni.showModal({
        title: '需要定位权限',
        content: '开启定位后才能判断是否在配送范围内。你仍可从附近地址中选择收货位置。',
        confirmText: '去设置',
        success: (result) => {
          if (result.confirm) uni.openSetting({})
        }
      })
    }
  })
}
function useCurrent() {
  picked.value = 0
  pick(0)
}
function doSearch() {
  uni.showToast({ title: '地址搜索（演示）', icon: 'none' })
}
function pick(i) {
  picked.value = i
  const p = pois.value[i]
  center.value = { lat: p.lat, lng: p.lng }
  inRange.value = i < 3
}
function confirm() {
  if (!inRange.value) {
    uni.showToast({ title: '该位置超出配送范围', icon: 'none' })
    return
  }
  const p = picked.value >= 0 ? pois.value[picked.value] : null
  const detail = p ? '上海市' + p.addr : currentAddr.value
  const def = user.defaultAddress
  if (def) {
    user.updateAddress(def.id, { detail, lat: center.value.lat, lng: center.value.lng })
  } else {
    user.addAddress({
      id: 'a' + Date.now(),
      name: '本人',
      phone: '138****8888',
      tag: '当前',
      detail,
      lat: center.value.lat,
      lng: center.value.lng,
      isDefault: true
    })
  }
  uni.showToast({ title: '已切换配送地址', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 600)
}
function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
}
.map-wrap {
  position: relative;
  height: 42vh;
}
.map {
  width: 100%;
  height: 100%;
}
.map-fallback { position: absolute; inset: 0; overflow: hidden; background: #e8eee8; }
.map-fallback__road { position: absolute; height: 16rpx; background: #fff; box-shadow: 0 0 0 2rpx #d6dfd6; transform: rotate(-24deg); }
.map-fallback__road--a { width: 140%; left: -20%; top: 42%; }
.map-fallback__road--b { width: 120%; left: -10%; top: 66%; transform: rotate(18deg); }
.map-fallback__pin { position: absolute; left: 48%; top: 42%; font-size: 60rpx; }
.map-fallback__label { position: absolute; left: 32rpx; top: 36rpx; padding: 12rpx 20rpx; border-radius: 12rpx; background: rgba(255,255,255,.85); color: var(--color-text-secondary); font-size: 24rpx; }
.topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  display: flex;
  align-items: center;
  padding-left: 24rpx;
  z-index: 10;
}
.topbar__back {
  font-size: 56rpx;
  color: var(--color-text-primary);
  width: 64rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  text-align: center;
  line-height: 64rpx;
  height: 64rpx;
}
.topbar__title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  margin-right: 88rpx;
}
.locate-btn {
  position: absolute;
  right: 32rpx;
  bottom: 32rpx;
  width: 88rpx;
  height: 88rpx;
  background: var(--color-surface);
  border-radius: 50%;
  box-shadow: var(--shadow-floating);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.locate-btn__ico {
  font-size: 44rpx;
}
.sheet {
  flex: 1;
  background: var(--color-surface);
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  margin-top: -32rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  min-height: 0;
  z-index: 5;
}
.current {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  background: var(--color-primary-light);
  border-radius: var(--radius-card);
}
.current__ico {
  font-size: 44rpx;
}
.current__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.current__label {
  font-size: 24rpx;
  color: var(--color-text-secondary);
}
.current__addr {
  font-size: 30rpx;
  font-weight: 600;
  margin-top: 4rpx;
}
.current__use {
  color: var(--color-primary);
  font-size: 28rpx;
  font-weight: 600;
}
.range {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
  padding: 20rpx 24rpx;
  background: var(--color-success-light);
  border-radius: var(--radius-input);
  font-size: 24rpx;
  color: var(--color-success);
}
.range--out {
  background: var(--color-warning-light);
  color: var(--color-warning);
}
.search {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
  height: 80rpx;
  padding: 0 24rpx;
  background: var(--color-surface-alt);
  border-radius: var(--radius-pill);
}
.search__ico {
  font-size: 30rpx;
  opacity: 0.6;
}
.search__ph {
  font-size: 26rpx;
  color: var(--color-text-tertiary);
}
.section-title {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  margin: 32rpx 0 16rpx;
}
.poi-list {
  flex: 1;
  min-height: 0;
}
.poi {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 0;
  border-bottom: 2rpx solid var(--color-border-light);
}
.poi__body {
  flex: 1;
  min-width: 0;
}
.poi__name {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--color-text-primary);
}
.poi__addr {
  display: block;
  font-size: 24rpx;
  color: var(--color-text-secondary);
  margin-top: 4rpx;
}
.poi__dist {
  font-size: 24rpx;
  color: var(--color-text-tertiary);
}
.poi--active .poi__name {
  color: var(--color-primary);
}
.poi__check {
  color: var(--color-primary);
  font-weight: 700;
}
.confirm {
  margin-top: 24rpx;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  background: var(--gradient-primary-btn);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-primary-glow);
}
</style>
