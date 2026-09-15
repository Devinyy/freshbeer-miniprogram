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
  left: 12px;
  right: 12px;
  bottom: calc(56px + env(safe-area-inset-bottom) + 8px);
  height: 56px;
  background: var(--color-secondary-dark);
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  padding: 0 8px 0 8px;
  box-shadow: var(--shadow-floating);
  z-index: var(--z-cart-bar);
}
.cart-bar__icon {
  position: relative;
  width: 48px;
  height: 48px;
  margin-top: -14px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary-glow);
}
.cart-bar__emoji {
  font-size: 24px;
}
.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--color-danger);
  color: #fff;
  font-size: 11px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-secondary-dark);
}
.cart-bar__info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}
.amount {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}
.tip {
  color: var(--color-text-tertiary);
  font-size: 11px;
}
.cart-bar__btn {
  background: var(--gradient-primary-btn);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  padding: 0 24px;
  height: 40px;
  line-height: 40px;
  border-radius: 20px;
  box-shadow: var(--shadow-primary-glow);
}
.cart-bar__btn:active {
  opacity: 0.85;
}
</style>
