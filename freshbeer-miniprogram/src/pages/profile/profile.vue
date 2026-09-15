<template>
  <view class="page">
    <view class="header" :style="{ paddingTop: $statusBarHeight + 20 + 'px' }">
      <view class="header__user">
        <view class="header__avatar"><fb-icon name="user" :size="30" color="#F5A623" /></view>
        <view class="header__info">
          <text class="header__name">{{ user.profile && user.profile.nickname ? user.profile.nickname : '鲜啤用户' }}</text>
          <view class="header__vip" v-if="user.realnameVerified">
            <text class="header__badge">✔ 已实名</text>
            <text class="header__lvl">Lv.{{ user.memberLevel }} 会员</text>
          </view>
          <view class="header__vip header__vip--off" v-else @tap="goRealname">未实名 · 点击认证 ›</view>
          <button v-if="!user.profile || !user.profile.phone" class="phone-login" open-type="getPhoneNumber" @getphonenumber="onPhoneLogin">微信手机号登录</button>
        </view>
        <fb-icon class="header__setting" name="settings" :size="22" color="#fff" @tap="goSetting" />
      </view>

      <!-- 金色储值卡 -->
      <view class="scard" @tap="goMember">
        <view class="scard__glow"></view>
        <view class="scard__top">
          <text class="scard__brand">鲜啤到 · 储值卡</text>
          <text class="scard__gold">GOLD</text>
        </view>
        <view class="scard__balance">
          <text class="scard__label">储值余额</text>
          <text class="scard__num num">¥{{ formatPrice(user.balance) }}</text>
        </view>
        <view class="scard__foot">
          <text class="scard__tip">储值支付享专享价</text>
          <view class="scard__btn" @tap.stop="recharge">立即充值</view>
        </view>
      </view>

      <view class="header__stats">
        <view class="stat" @tap="goCoupon">
          <text class="stat__num num">3</text>
          <text class="stat__label">优惠券</text>
        </view>
        <view class="stat" @tap="goMember">
          <text class="stat__num num">{{ points }}</text>
          <text class="stat__label">积分</text>
        </view>
        <view class="stat" @tap="onMenu({ key: 'fav' })">
          <text class="stat__num num">8</text>
          <text class="stat__label">收藏</text>
        </view>
      </view>
    </view>

    <view class="orders card">
      <view class="orders__head">
        <text>我的订单</text>
        <text class="orders__all" @tap="goOrder">全部 ›</text>
      </view>
      <view class="orders__grid">
        <view class="o" v-for="(o, i) in orderEntries" :key="i" @tap="goOrder">
          <fb-icon class="o__ico" :name="o.ico" :size="26" color="#2C1810" />
          <text class="o__label">{{ o.label }}</text>
        </view>
      </view>
    </view>

    <view class="menu card">
      <view v-if="user.isAdmin" class="menu__item" @tap="goAdminProducts">
        <fb-icon class="menu__ico" name="settings" :size="20" />
        <text class="menu__label">商品管理</text>
        <text class="menu__state on">管理员</text>
        <text class="menu__arrow">›</text>
      </view>
      <view class="menu__item" v-for="(m, i) in menu" :key="i" @tap="onMenu(m)">
        <fb-icon class="menu__ico" :name="m.ico" :size="20" />
        <text class="menu__label">{{ m.label }}</text>
        <text v-if="m.key === 'realname'" class="menu__state" :class="{ on: user.realnameVerified }">{{
          user.realnameVerified ? '已认证' : '未认证'
        }}</text>
        <text class="menu__arrow">›</text>
      </view>
    </view>

    <view style="height: 96px"></view>
    <fb-compliance-bar />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { formatPrice } from '@/utils/format'
import { syncCustomTabBar } from '@/utils/tabbar'

const user = useUserStore()
onShow(() => syncCustomTabBar('pages/profile/profile'))

const points = computed(() => Math.floor(user.balance) + 260)

const orderEntries = [
  { ico: 'card', label: '待支付' },
  { ico: 'truck', label: '配送中' },
  { ico: 'star', label: '待评价' },
  { ico: 'settings', label: '退款/售后' }
]
const menu = [
  { ico: 'star', label: '会员中心', key: 'member' }, { ico: 'card', label: '储值卡', key: 'balance' },
  { ico: 'ticket', label: '优惠券', key: 'coupon' }, { ico: 'location', label: '地址管理', key: 'address' },
  { ico: 'heart', label: '我的收藏', key: 'fav' }, { ico: 'order', label: '常购清单', key: 'often' },
  { ico: 'shield', label: '实名认证', key: 'realname' }, { ico: 'target', label: '营销活动', key: 'promo' },
  { ico: 'book', label: '精酿科普', key: 'wiki' }, { ico: 'headset', label: '客服中心', key: 'service' }
]

function recharge() {
  uni.showActionSheet({
    itemList: ['充 200 送 15', '充 500 送 50', '充 1000 送 120'],
    success: (r) => {
      const opts = [
        { a: 200, g: 15 },
        { a: 500, g: 50 },
        { a: 1000, g: 120 }
      ]
      const o = opts[r.tapIndex]
      user.setBalance(user.balance + o.a + o.g)
      user.setMember(Math.max(user.memberLevel, 1))
      uni.showToast({ title: `到账 ¥${o.a + o.g}`, icon: 'success' })
    }
  })
}
function goRealname() {
  uni.navigateTo({ url: '/pages/realname/realname' })
}
function goSetting() {
  uni.showToast({ title: '设置（开发中）', icon: 'none' })
}
function goOrder() {
  uni.switchTab({ url: '/pages/order/order' })
}
function goAdminProducts() {
  uni.navigateTo({ url: '/pages/admin-products/admin-products' })
}
async function onPhoneLogin(e) {
  try {
    await user.loginWithPhone(e)
    uni.showToast({ title: user.isAdmin ? '管理员登录成功' : '登录成功', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: err.message || '手机号授权失败', icon: 'none' })
  }
}
function goCoupon() {
  uni.showToast({ title: '优惠券（开发中）', icon: 'none' })
}
function goMember() {
  if (!user.realnameVerified) {
    uni.navigateTo({ url: '/pages/realname/realname' })
  } else {
    uni.showToast({ title: '会员中心（开发中）', icon: 'none' })
  }
}
function onMenu(m) {
  if (m.key === 'address') {
    uni.navigateTo({ url: '/pages/address/address' })
  } else if (m.key === 'realname') {
    goRealname()
  } else if (m.key === 'member' || m.key === 'balance') {
    goMember()
  } else if (m.key === 'coupon') {
    goCoupon()
  } else {
    uni.showToast({ title: m.label + '（开发中）', icon: 'none' })
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: env(safe-area-inset-bottom);
}
.header {
  background: linear-gradient(165deg, #4a2f1c 0%, #2c1810 100%);
  padding: calc(env(safe-area-inset-top) + 20px) 16px 20px;
}
.header__user {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(245, 166, 35, 0.2);
  border: 2px solid var(--color-member-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}
.header__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.header__name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}
.header__vip {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header__badge {
  font-size: 11px;
  color: var(--color-secondary-dark);
  background: var(--color-member-gold);
  padding: 1px 8px;
  border-radius: var(--radius-tag);
  font-weight: 600;
}
.header__lvl {
  font-size: 12px;
  color: var(--color-member-gold);
}
.header__vip--off {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}
.phone-login {
  margin: 2px 0 0;
  padding: 0;
  line-height: 20px;
  font-size: 11px;
  color: var(--color-member-gold);
  background: transparent;
  border: 0;
}
.phone-login::after { border: 0; }
.header__setting {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.9);
}
.scard {
  position: relative;
  margin-top: 18px;
  border-radius: var(--radius-card);
  background: linear-gradient(135deg, #f5d98f 0%, #d4a843 55%, #b8862b 100%);
  padding: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(184, 134, 43, 0.35);
}
.scard__glow {
  position: absolute;
  top: -40px;
  right: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
}
.scard__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.scard__brand {
  font-size: 13px;
  color: #5a3b15;
  font-weight: 600;
}
.scard__gold {
  font-size: 12px;
  color: #5a3b15;
  font-weight: 700;
  letter-spacing: 1px;
}
.scard__balance {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
}
.scard__label {
  font-size: 11px;
  color: #6b4a1a;
}
.scard__num {
  font-size: 30px;
  font-weight: 700;
  color: #3d2817;
  margin-top: 2px;
}
.scard__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
}
.scard__tip {
  font-size: 11px;
  color: #6b4a1a;
}
.scard__btn {
  background: var(--color-secondary-dark);
  color: var(--color-member-gold);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: var(--radius-pill);
}
.header__stats {
  display: flex;
  margin-top: 18px;
}
.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat__num {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}
.stat__label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 2px;
}
.card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  margin: 12px 16px;
  padding: 16px;
  box-shadow: var(--shadow-card);
}
.orders__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.orders__all {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.orders__grid {
  display: flex;
}
.o {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.o__ico {
  font-size: 26px;
}
.o__label {
  font-size: 12px;
  color: var(--color-text-primary);
}
.menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border-light);
}
.menu__item:last-child {
  border-bottom: none;
}
.menu__ico {
  font-size: 20px;
}
.menu__label {
  flex: 1;
  font-size: 15px;
  color: var(--color-text-primary);
}
.menu__state {
  font-size: 12px;
  color: var(--color-warning);
  margin-right: 6px;
}
.menu__state.on {
  color: var(--color-success);
}
.menu__arrow {
  color: var(--color-text-tertiary);
  font-size: 18px;
}
</style>
