<template>
  <view class="page-nav" :style="{ height: 44 + statusBarHeight + 'px', paddingTop: statusBarHeight + 'px' }">
    <view class="page-nav__back" @tap="goBack">‹</view>
    <text class="page-nav__title">{{ title }}</text>
    <view class="page-nav__placeholder"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ title: { type: String, required: true } })
const info = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
const statusBarHeight = ref(info.statusBarHeight || 0)

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) uni.navigateBack()
  else uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.page-nav { box-sizing: border-box; display: flex; align-items: center; padding-left: 24rpx; padding-right: 24rpx; background: var(--color-bg); }
.page-nav__back, .page-nav__placeholder { width: 64rpx; flex: 0 0 64rpx; }
.page-nav__back { color: var(--color-text-primary); font-size: 60rpx; line-height: 64rpx; }
.page-nav__title { flex: 1; text-align: center; color: var(--color-text-primary); font-size: 34rpx; font-weight: 600; }
</style>
