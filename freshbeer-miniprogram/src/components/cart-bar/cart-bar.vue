<template>
  <view class="cart-bar" v-if="count > 0 || alwaysShow">
    <view class="cart-bar__icon" @tap="$emit('cart')">
      <fb-icon class="cart-bar__emoji" name="cart" :size="24" color="#fff" />
      <text v-if="count > 0" class="badge">{{ count }}</text>
    </view>
    <view class="cart-bar__info">
      <view class="amount-row">
        <text class="amount num">¥{{ formatPrice(amount) }}</text>
      </view>
      <text class="tip">另需配送费 ¥{{ formatPrice(deliveryFee) }}</text>
    </view>
    <view class="cart-bar__btn" @tap="$emit('checkout')">去结算</view>
  </view>
</template>

<script setup>
import { formatPrice } from '@/utils/format'
defineProps({
  count: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 5 },
  alwaysShow: { type: Boolean, default: false }
})
defineEmits(['cart', 'checkout'])
</script>

<style scoped>
.cart-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(112rpx + env(safe-area-inset-bottom) + 16rpx);
  height: 112rpx;
  background: var(--color-secondary-dark);
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  padding: 0 16rpx 0 16rpx;
  box-shadow: var(--shadow-floating);
  z-index: var(--z-cart-bar);
}
.cart-bar__icon {
  position: relative;
  width: 96rpx;
  height: 96rpx;
  margin-top: -28rpx;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary-glow);
}
.cart-bar__emoji {
  font-size: 48rpx;
}
.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 8rpx;
  background: var(--color-danger);
  color: #fff;
  font-size: 22rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid var(--color-secondary-dark);
}
.cart-bar__info {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
}
.amount {
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
}
.tip {
  color: var(--color-text-tertiary);
  font-size: 22rpx;
}
.cart-bar__btn {
  background: var(--gradient-primary-btn);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  padding: 0 48rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  box-shadow: var(--shadow-primary-glow);
}
.cart-bar__btn:active {
  opacity: 0.85;
}
</style>
