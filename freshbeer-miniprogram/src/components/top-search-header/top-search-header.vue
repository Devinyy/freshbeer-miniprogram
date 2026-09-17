<template>
  <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="header__top" :style="{ height: topHeight + 'px', paddingRight: capsuleRight + 'px' }">
      <view v-if="location" class="header__location" @tap="$emit('location')"><fb-icon name="location" :size="16" color="#F5A623" /><text class="header__location-text ellipsis-1">{{ location }}</text><text class="header__arrow">▾</text></view>
      <text v-else class="header__title">{{ title }}</text>
    </view>
    <view class="header__search-row"><view class="header__search" @tap="$emit('search')"><fb-icon name="search" :size="16" color="#B0A490" /><text class="header__placeholder">{{ placeholder }}</text></view></view>
  </view>
</template>
<script setup>
import { computed } from 'vue'
defineProps({ title: { type: String, default: '' }, location: { type: String, default: '' }, placeholder: { type: String, default: '搜索精酿 / 品牌' } })
defineEmits(['location', 'search'])
const systemInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
const menuButton = uni.getMenuButtonBoundingClientRect ? uni.getMenuButtonBoundingClientRect() : null
const statusBarHeight = systemInfo.statusBarHeight || 0
const capsuleRight = menuButton ? Math.max(12, systemInfo.windowWidth - menuButton.left + 8) : 96
const topHeight = computed(() => menuButton ? menuButton.bottom + 8 - statusBarHeight : 44)
</script>
<style scoped>
.header{background:var(--color-bg)}.header__top{display:flex;align-items:center;padding-left:24rpx;box-sizing:border-box}.header__location{display:flex;align-items:center;min-width:0;gap:4rpx}.header__location-text{min-width:0;font-size:26rpx;font-weight:600;color:var(--color-text-primary)}.header__arrow{flex-shrink:0;font-size:20rpx;color:var(--color-text-secondary)}.header__title{font-size:34rpx;font-weight:600;color:var(--color-text-primary)}.header__search-row{height:88rpx;display:flex;align-items:center;padding:0 24rpx;margin-bottom:14rpx}.header__search{width:100%;height:72rpx;border:2rpx solid var(--color-border);border-radius:36rpx;background:var(--color-surface);display:flex;align-items:center;gap:12rpx;padding:0 24rpx}.header__placeholder{font-size:26rpx;color:var(--color-text-tertiary)}
</style>
