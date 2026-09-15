<template>
  <view class="page">
    <fb-page-nav title="收银台" />

    <view class="amount-box">
      <text class="amount-box__label">需支付</text>
      <view class="amount-box__num num">¥{{ formatPrice(payable) }}</view>
      <view class="amount-box__countdown"
        >支付剩余 <text class="num">{{ formatCountdown(left) }}</text></view
      >
    </view>

    <view class="methods card">
      <view class="methods__title">支付方式</view>
      <view class="method" :class="{ on: method === 'wechat' }" @tap="method = 'wechat'">
        <fb-icon class="method__ico" name="card" :size="22" color="#07C160" />
        <view class="method__body">
          <text class="method__name">微信支付</text>
          <text class="method__desc">推荐 · 安全便捷</text>
        </view>
        <view class="method__radio" :class="{ on: method === 'wechat' }"></view>
      </view>
      <view class="method" :class="{ on: method === 'balance' }" @tap="method = 'balance'">
        <fb-icon class="method__ico" name="card" :size="22" color="#C87921" />
        <view class="method__body">
          <text class="method__name">储值卡余额</text>
          <text class="method__desc">余额 ¥{{ formatPrice(user.balance) }}</text>
        </view>
        <view class="method__radio" :class="{ on: method === 'balance' }"></view>
      </view>
    </view>

    <view class="safe" style="height: 96px"></view>

    <view class="compliance-fixed"><fb-compliance-bar /></view>

    <view class="footbar">
      <view class="footbar__btn" @tap="pay">立即支付 ¥{{ formatPrice(payable) }}</view>
    </view>

    <!-- 储值卡密码弹层（mock） -->
    <view v-if="pwdShow" class="pwd-mask" @tap="pwdShow = false">
      <view class="pwd" @tap.stop>
        <view class="pwd__title">输入支付密码</view>
        <view class="pwd__dots">
          <view class="pwd__dot" :class="{ on: pwdLen >= i }" v-for="i in 6" :key="i"></view>
        </view>
        <view class="pwd__confirm" @tap="confirmBalancePay">确认支付</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { payOrder } from '@/services/payment'
import { useUserStore } from '@/store/user'
import { formatPrice, formatCountdown } from '@/utils/format'

const user = useUserStore()
const orderId = ref('')
const payable = ref(0)
const method = ref('wechat')
const left = ref(900)
const pwdShow = ref(false)
const pwdLen = ref(6)
let timer = null

onLoad((opts) => {
  orderId.value = opts.orderId || ''
  payable.value = Number(opts.payable) || 0
  if (opts.method === 'balance' || opts.method === 'wechat') method.value = opts.method
  timer = setInterval(() => {
    if (left.value > 0) left.value--
    else clearInterval(timer)
  }, 1000)
})
onUnload(() => {
  if (timer) clearInterval(timer)
})

async function pay() {
  if (left.value <= 0) {
    uni.showToast({ title: '支付已超时，请重新下单', icon: 'none' })
    return
  }
  if (method.value === 'wechat') {
    uni.showLoading({ title: '支付中' })
    const res = await payOrder(orderId.value, method.value)
    uni.hideLoading()
    if (res.success) {
      goResult(res.order)
    } else if (res.reason === 'cancelled') {
      uni.showToast({ title: '已取消支付', icon: 'none' })
    } else {
      uni.showToast({ title: '支付失败', icon: 'none' })
    }
  } else {
    if (user.balance < payable.value) {
      uni.showToast({ title: '储值卡余额不足', icon: 'none' })
      return
    }
    pwdShow.value = true
  }
}
async function confirmBalancePay() {
  pwdShow.value = false
  uni.showLoading({ title: '支付中' })
  const res = await payOrder(orderId.value, 'balance')
  uni.hideLoading()
  if (!res.success) {
    uni.showToast({ title: '余额支付失败', icon: 'none' })
    return
  }
  user.setBalance(Math.max(0, user.balance - payable.value))
  goResult(res.order)
}
function goResult() {
  uni.redirectTo({
    url: '/pages/payment-result/payment-result?orderId=' + orderId.value + '&payable=' + payable.value
  })
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
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}
.nav__title {
  font-size: 17px;
  font-weight: 600;
}
.amount-box {
  background: var(--gradient-primary-btn);
  color: #fff;
  padding: 28px 16px 32px;
  text-align: center;
}
.amount-box__label {
  font-size: 13px;
  opacity: 0.9;
}
.amount-box__num {
  font-size: 44px;
  font-weight: 700;
  margin: 6px 0;
}
.amount-box__countdown {
  font-size: 13px;
  opacity: 0.9;
}
.methods {
  margin: 16px;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
}
.methods__title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
}
.method {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}
.method:last-child {
  border-bottom: none;
}
.method__ico {
  font-size: 24px;
}
.method__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.method__name {
  font-size: 15px;
  font-weight: 500;
}
.method__desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.method__radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
}
.method__radio.on {
  border-color: var(--color-primary);
  background: var(--color-primary);
  box-shadow: inset 0 0 0 3px #fff;
}
.compliance-fixed {
  position: fixed;
  bottom: 56px;
  left: 0;
  right: 0;
  background: var(--color-bg);
  z-index: 10;
}
.footbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  padding: 0 16px env(safe-area-inset-bottom);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  z-index: 20;
}
.footbar__btn {
  flex: 1;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background: var(--gradient-primary-btn);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-primary-glow);
}
.pwd-mask {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  z-index: var(--z-modal);
  display: flex;
  align-items: flex-end;
}
.pwd {
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  padding: 24px 16px calc(24px + env(safe-area-inset-bottom));
}
.pwd__title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}
.pwd__dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}
.pwd__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
}
.pwd__dot.on {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.pwd__confirm {
  background: var(--gradient-primary-btn);
  color: #fff;
  text-align: center;
  height: 48px;
  line-height: 48px;
  border-radius: var(--radius-pill);
  font-size: 16px;
  font-weight: 600;
}
</style>
