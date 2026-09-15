<template>
  <view class="splash">
    <view class="splash__inner" :class="{ 'splash__inner--out': fadeOut }">
      <view class="logo">
        <view class="logo__glass">
          <view class="logo__foam"></view>
          <view class="logo__beer"></view>
        </view>
      </view>
      <text class="brand">鲜啤到</text>
      <text class="slogan">好啤酒，新鲜到</text>
      <view class="dots">
        <view class="dot" v-for="i in 3" :key="i" :style="{ animationDelay: i * 0.15 + 's' }"></view>
      </view>
    </view>
    <view class="splash__foot">
      <text class="splash__warn">未成年人禁止购买酒精饮品 · 适量饮酒，禁止酒驾</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const fadeOut = ref(false)

onLoad(() => {
  setTimeout(() => {
    fadeOut.value = true
  }, 1200)
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/index/index' })
  }, 1600)
})
</script>

<style scoped>
.splash {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(160deg, #ffe6bd 0%, #f5a623 45%, #3d2817 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.splash__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: opacity 0.4s ease;
}
.splash__inner--out {
  opacity: 0;
}
.logo {
  margin-bottom: 48rpx;
}
.logo__glass {
  width: 176rpx;
  height: 220rpx;
  background: rgba(255, 255, 255, 0.22);
  border: 6rpx solid rgba(255, 255, 255, 0.85);
  border-radius: 20rpx 20rpx 32rpx 32rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16rpx 48rpx rgba(61, 40, 23, 0.3);
}
.logo__beer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72%;
  background: linear-gradient(180deg, #ffd25e, #e8951a);
  animation: fill 1s ease-out;
}
.logo__foam {
  position: absolute;
  left: 0;
  right: 0;
  top: 16%;
  height: 32rpx;
  background: #fff;
  border-radius: 50%;
  z-index: 2;
}
@keyframes fill {
  from {
    height: 0;
  }
  to {
    height: 72%;
  }
}
.brand {
  font-size: 68rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 8rpx;
  text-shadow: 0 4rpx 16rpx rgba(61, 40, 23, 0.35);
}
.slogan {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.92);
  margin-top: 20rpx;
  letter-spacing: 4rpx;
}
.dots {
  display: flex;
  gap: 16rpx;
  margin-top: 64rpx;
}
.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.75);
  animation: bounce 1s infinite ease-in-out;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-12rpx);
    opacity: 1;
  }
}
.splash__foot {
  position: absolute;
  bottom: calc(48rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  text-align: center;
}
.splash__warn {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
}
@media (prefers-reduced-motion: reduce) {
  .logo__beer,
  .dot {
    animation: none;
  }
}
</style>
