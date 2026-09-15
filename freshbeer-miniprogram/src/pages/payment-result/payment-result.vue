<template>
  <view class="page">
    <view class="nav" :style="{ paddingTop: $statusBarHeight + 'px', height: 44 + $statusBarHeight + 'px' }"><text class="nav__title">支付结果</text></view>

    <view class="result">
      <view class="result__icon" :class="{ 'result__icon--in': animate }">✓</view>
      <text class="result__title">支付成功</text>
      <text class="result__amount num">¥{{ formatPrice(payable) }}</text>
    </view>

    <view class="progress card">
      <view class="progress__row">
        <fb-icon class="progress__ico" name="order" :size="22" />
        <view class="progress__body">
          <text class="progress__title">订单已提交，商家正在备货</text>
          <text class="progress__sub">预计 15-30 分钟送达 · 全程冷链保鲜</text>
        </view>
      </view>
      <view class="progress__bar">
        <view class="progress__step done">已支付</view>
        <view class="progress__line done"></view>
        <view class="progress__step doing">备货中</view>
        <view class="progress__line"></view>
        <view class="progress__step">配送中</view>
        <view class="progress__line"></view>
        <view class="progress__step">已送达</view>
      </view>
    </view>

    <!-- 储值充值推荐 -->
    <view class="recharge card">
      <view class="recharge__head">
        <text class="recharge__title">开通储值卡，笔笔享专享价</text>
        <text class="recharge__badge">充 500 送 50</text>
      </view>
      <text class="recharge__desc">储值余额支付立减，会员专享秒杀 & 生日礼，本单最高可再省 12%。</text>
      <view class="recharge__opts">
        <view class="recharge__opt" v-for="(r, i) in rechargeOpts" :key="i" @tap="recharge(r)">
          <text class="recharge__opt-amount num">¥{{ r.amount }}</text>
          <text class="recharge__opt-gift">送 ¥{{ r.gift }}</text>
        </view>
      </view>
    </view>

    <view class="actions">
      <view class="act" @tap="goOrderList">查看订单</view>
      <view class="act act--primary" @tap="goDetail">查看配送</view>
    </view>

    <view style="height: 24px"></view>
    <fb-compliance-bar />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { formatPrice } from '@/utils/format'

const user = useUserStore()
const orderId = ref('')
const payable = ref(0)
const animate = ref(false)

const rechargeOpts = [
  { amount: 200, gift: 15 },
  { amount: 500, gift: 50 },
  { amount: 1000, gift: 120 }
]

onLoad((opts) => {
  orderId.value = opts.orderId || ''
  payable.value = Number(opts.payable) || 0
  setTimeout(() => {
    animate.value = true
  }, 100)
})

function recharge(r) {
  user.setBalance(user.balance + r.amount + r.gift)
  user.setMember(Math.max(user.memberLevel, 1))
  uni.showToast({ title: `充值成功，到账 ¥${r.amount + r.gift}`, icon: 'success' })
}
function goOrderList() {
  uni.switchTab({ url: '/pages/order/order' })
}
function goDetail() {
  uni.redirectTo({ url: '/pages/order-detail/order-detail?orderId=' + orderId.value })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: env(safe-area-inset-bottom);
}
.nav {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}
.nav__title {
  font-size: 17px;
  font-weight: 600;
}
.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 28px;
}
.result__icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-success);
  color: #fff;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.4);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.35);
}
.result__icon--in {
  transform: scale(1);
  opacity: 1;
}
.result__title {
  font-size: 20px;
  font-weight: 700;
  margin-top: 16px;
}
.result__amount {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 8px;
}
.card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  margin: 0 16px 12px;
  padding: 16px;
  box-shadow: var(--shadow-card);
}
.progress__row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.progress__ico {
  font-size: 26px;
}
.progress__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.progress__title {
  font-size: 14px;
  font-weight: 600;
}
.progress__sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}
.progress__bar {
  display: flex;
  align-items: center;
  margin-top: 16px;
}
.progress__step {
  font-size: 11px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}
.progress__step.done {
  color: var(--color-success);
  font-weight: 600;
}
.progress__step.doing {
  color: var(--color-primary);
  font-weight: 600;
}
.progress__line {
  flex: 1;
  height: 2px;
  background: var(--color-border);
  margin: 0 6px;
}
.progress__line.done {
  background: var(--color-success);
}
.recharge {
  background: linear-gradient(135deg, #fff6e6, #ffe9c7);
}
.recharge__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.recharge__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-secondary-dark);
}
.recharge__badge {
  font-size: 11px;
  background: var(--color-flash-sale);
  color: #fff;
  padding: 2px 8px;
  border-radius: var(--radius-tag);
}
.recharge__desc {
  display: block;
  font-size: 12px;
  color: var(--color-secondary-brown);
  margin-top: 8px;
  line-height: 1.5;
}
.recharge__opts {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.recharge__opt {
  flex: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-card);
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.recharge__opt-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
}
.recharge__opt-gift {
  font-size: 11px;
  color: var(--color-flash-sale);
}
.actions {
  display: flex;
  gap: 12px;
  margin: 4px 16px 0;
}
.act {
  flex: 1;
  text-align: center;
  height: 46px;
  line-height: 46px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: 15px;
  color: var(--color-text-primary);
}
.act--primary {
  background: var(--gradient-primary-btn);
  color: #fff;
  border: none;
  box-shadow: var(--shadow-primary-glow);
}
@media (prefers-reduced-motion: reduce) {
  .result__icon {
    transition: none;
  }
}
</style>
