<template>
  <view class="page">
    <fb-page-nav title="地址管理" />

    <scroll-view scroll-y class="content">
      <view class="addr" v-for="a in user.addresses" :key="a.id" @tap="pick(a)">
        <view class="addr__top">
          <text class="addr__name">{{ a.name }}</text>
          <text class="addr__phone">{{ maskPhone(a.phone) }}</text>
          <text class="addr__tag" v-if="a.tag">{{ a.tag }}</text>
          <text class="addr__default" v-if="a.isDefault">默认</text>
        </view>
        <view class="addr__detail">{{ a.detail }}</view>
        <view class="addr__ops">
          <text class="op" v-if="!a.isDefault" @tap.stop="setDefault(a.id)">设为默认</text>
          <text class="op" @tap.stop="edit(a.id)">编辑</text>
          <text class="op op--del" @tap.stop="del(a.id)">删除</text>
        </view>
      </view>

      <view class="empty" v-if="!user.addresses.length">
        <text class="empty__text">还没有收货地址</text>
      </view>
      <view style="height: 180rpx"></view>
    </scroll-view>

    <view class="footbar" @tap="add">＋ 新增收货地址</view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { getAddresses } from '@/services/product'
import { maskPhone } from '@/utils/format'

const user = useUserStore()

onMounted(async () => {
  if (user.addresses.length === 0) {
    const res = await getAddresses()
    user.addresses = res.addresses || []
  }
})

function pick(a) {
  // 从确认订单页进来时，选地址后返回
  const pages = getCurrentPages()
  const prev = pages[pages.length - 2]
  if (prev && prev.route === 'pages/order-confirm/order-confirm') {
    user.setDefaultAddress(a.id)
    uni.navigateBack()
  }
}
function setDefault(id) {
  user.setDefaultAddress(id)
}
function del(id) {
  uni.showModal({
    title: '删除地址',
    content: '确定删除该收货地址？',
    success: (r) => {
      if (r.confirm) user.removeAddress(id)
    }
  })
}
function edit(id) {
  uni.navigateTo({ url: '/pages/address-edit/address-edit?id=' + id })
}
function add() {
  uni.navigateTo({ url: '/pages/address-edit/address-edit' })
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
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
}
.nav__title {
  font-size: 34rpx;
  font-weight: 600;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 32rpx;
}
.addr {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 32rpx;
  box-shadow: var(--shadow-card);
  margin-bottom: 24rpx;
}
.addr__top {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.addr__name {
  font-size: 32rpx;
  font-weight: 700;
}
.addr__phone {
  font-size: 28rpx;
  color: var(--color-text-secondary);
}
.addr__tag {
  font-size: 22rpx;
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 2rpx 12rpx;
  border-radius: var(--radius-tag);
}
.addr__default {
  font-size: 22rpx;
  background: var(--color-success-light);
  color: var(--color-success);
  padding: 2rpx 12rpx;
  border-radius: var(--radius-tag);
}
.addr__detail {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  margin-top: 16rpx;
}
.addr__ops {
  display: flex;
  justify-content: flex-end;
  gap: 40rpx;
  margin-top: 20rpx;
}
.op {
  font-size: 26rpx;
  color: var(--color-primary);
}
.op--del {
  color: var(--color-danger);
}
.empty {
  text-align: center;
  padding: 120rpx 0;
}
.empty__text {
  color: var(--color-text-tertiary);
  font-size: 28rpx;
}
.footbar {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: calc(32rpx + env(safe-area-inset-bottom));
  height: 96rpx;
  background: var(--gradient-primary-btn);
  color: #fff;
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: var(--shadow-primary-glow);
  z-index: 20;
}
</style>
