<template>
  <view class="page">
    <fb-page-nav title="确认订单" />

    <scroll-view scroll-y class="content">
      <!-- 地址 -->
      <view class="addr card" @tap="goAddress">
        <fb-icon class="addr__pin" name="location" :size="20" color="#C87921" />
        <view class="addr__body">
          <view class="addr__line1" v-if="address">
            <text class="addr__name">{{ address.name }}</text>
            <text class="addr__phone">{{ maskPhone(address.phone) }}</text>
          </view>
          <view class="addr__detail" v-if="address">{{ address.detail }}</view>
          <view class="addr__empty" v-else>请选择收货地址</view>
        </view>
        <text class="addr__arrow">›</text>
      </view>

      <!-- 配送方式 -->
      <view class="block card">
        <view class="block__title">配送方式</view>
        <view class="seg">
          <view
            class="seg__item"
            :class="{ on: deliveryType === 'immediate' }"
            @tap="deliveryType = 'immediate'"
            >立即配送</view
          >
          <view
            class="seg__item"
            :class="{ on: deliveryType === 'appoint' }"
            @tap="openAppoint"
            >预约配送</view
          >
          <view
            class="seg__item"
            :class="{ on: deliveryType === 'self' }"
            @tap="deliveryType = 'self'"
            >到店自提</view
          >
        </view>
        <view class="appoint-tip" v-if="deliveryType === 'appoint'">
          送达时间：<text class="appoint-tip__val">{{ appointTime || '请选择' }}</text>
        </view>
      </view>

      <!-- 商品 -->
      <view class="block card">
        <view class="block__title">商品清单（{{ cart.totalCount }} 件）</view>
        <view class="order-item" v-for="it in cart.items" :key="it.key">
          <view class="order-item__img"><fb-icon :name="emoji(it)" :size="34" color="#C87921" /></view>
          <view class="order-item__body">
            <view class="order-item__name ellipsis-1">{{ it.name }}</view>
            <view class="order-item__spec" v-if="it.spec">{{ it.spec }}</view>
            <view class="order-item__price num">¥{{ formatPrice(it.price * it.qty) }}</view>
          </view>
          <text class="order-item__qty">×{{ it.qty }}</text>
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="block card">
        <view class="block__title">支付方式</view>
        <view class="pay" :class="{ on: payMethod === 'wechat' }" @tap="payMethod = 'wechat'">
          <fb-icon class="pay__ico" name="card" :size="22" color="#07C160" />
          <text class="pay__name">微信支付</text>
          <view class="pay__radio" :class="{ on: payMethod === 'wechat' }"></view>
        </view>
        <view class="pay" :class="{ on: payMethod === 'balance' }" @tap="payMethod = 'balance'">
          <fb-icon class="pay__ico" name="card" :size="22" color="#C87921" />
          <text class="pay__name">储值卡余额</text>
          <text class="pay__desc num">余额 ¥{{ formatPrice(user.balance) }}</text>
          <view class="pay__radio" :class="{ on: payMethod === 'balance' }"></view>
        </view>
      </view>

      <!-- 订单备注 -->
      <view class="block card">
        <view class="block__title">订单备注</view>
        <input class="remark" v-model="remark" placeholder="口味、放门口、需要开瓶器等（选填）" maxlength="50" />
      </view>

      <!-- 费用 -->
      <view class="block card">
        <view class="fee"><text>商品金额</text><text class="num">¥{{ formatPrice(cart.totalAmount) }}</text></view>
        <view class="fee"><text>配送费</text><text class="num">¥{{ formatPrice(deliveryFee) }}</text></view>
        <view class="fee" v-if="discount">
          <text>{{ couponLabel }}</text><text class="num fee--cut">-¥{{ formatPrice(discount) }}</text>
        </view>
        <view class="fee fee--total">
          <text>实付</text><text class="num">¥{{ formatPrice(payable) }}</text>
        </view>
      </view>

      <view style="height: 90px"></view>
    </scroll-view>

    <view class="compliance-fixed"><fb-compliance-bar /></view>

    <view class="footbar">
      <view class="footbar__total">
        合计 <text class="num">¥{{ formatPrice(payable) }}</text>
      </view>
      <view class="footbar__btn" @tap="submit">提交订单</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import { createOrder } from '@/services/payment'
import { getAddresses } from '@/services/product'
import { formatPrice, maskPhone } from '@/utils/format'

const cart = useCartStore()
const user = useUserStore()

onMounted(async () => {
  // 演示态预载地址，保证「去结算」可直接走通
  if (user.addresses.length === 0) {
    const res = await getAddresses()
    if (res.addresses && res.addresses.length) {
      res.addresses.forEach((a) => user.addAddress(a))
    }
  }
})

const deliveryType = ref('immediate')
const deliveryFee = ref(5)
const discount = computed(() => cart.couponDiscount)
const appointTime = ref('')
const remark = ref('')
const payMethod = ref('wechat')
const submitting = ref(false)

const couponLabel = computed(() => (cart.coupon ? cart.coupon.title : '优惠券'))
const address = computed(() => user.defaultAddress)

const payable = computed(() => {
  let v = cart.totalAmount + deliveryFee.value - discount.value
  return v > 0 ? v : 0
})

function emoji(it) {
  return it.categoryId === 'comp' ? 'warning' : 'beer'
}
function openAppoint() {
  deliveryType.value = 'appoint'
  uni.showActionSheet({
    itemList: ['今天 19:00-20:00', '今天 20:00-21:00', '明天 19:00-20:00', '明天 20:00-21:00'],
    success: (r) => {
      const map = ['今天 19:00-20:00', '今天 20:00-21:00', '明天 19:00-20:00', '明天 20:00-21:00']
      appointTime.value = map[r.tapIndex]
    }
  })
}
async function submit() {
  if (submitting.value) return
  if (!user.realnameVerified) {
    uni.showModal({
      title: '需实名认证',
      content: '购买酒类商品前需完成实名认证（仅限成年人）',
      confirmText: '去认证',
      success: (r) => {
        if (r.confirm) uni.navigateTo({ url: '/pages/realname/realname' })
      }
    })
    return
  }
  if (!address.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }
  if (cart.isEmpty) {
    uni.showToast({ title: '购物车为空', icon: 'none' })
    return
  }
  submitting.value = true
  uni.showLoading({ title: '提交中' })
  try {
    const loginUser = await user.ensureLogin()
    const res = await createOrder({
      items: cart.items.map((it) => ({
        productId: it.productId,
        name: it.name,
        price: it.price,
        qty: it.qty,
        spec: it.spec
      })),
      address: address.value,
      deliveryType: deliveryType.value,
      deliveryTime: appointTime.value,
      remark: remark.value,
      discount: discount.value,
      openid: loginUser.openid
    })
    if (res && res.order) {
      cart.clear()
      uni.navigateTo({
        url:
          '/pages/payment/payment?orderId=' +
          res.order.orderId +
          '&payable=' +
          res.order.payable +
          '&method=' +
          payMethod.value
      })
    } else {
      uni.showToast({ title: res && res.msg ? res.msg : '下单失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: e.message || '下单失败', icon: 'none' })
  } finally {
    uni.hideLoading()
    submitting.value = false
  }
}
function goAddress() {
  uni.navigateTo({ url: '/pages/address/address?from=confirm' })
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
.content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}
.card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;
}
.addr {
  display: flex;
  align-items: center;
  gap: 12px;
}
.addr__pin {
  font-size: 22px;
}
.addr__body {
  flex: 1;
  min-width: 0;
}
.addr__line1 {
  display: flex;
  gap: 12px;
  align-items: baseline;
}
.addr__name {
  font-size: 16px;
  font-weight: 700;
}
.addr__phone {
  font-size: 14px;
  color: var(--color-text-secondary);
}
.addr__detail {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
.addr__empty {
  font-size: 15px;
  color: var(--color-primary);
  font-weight: 600;
}
.addr__arrow {
  color: var(--color-text-tertiary);
  font-size: 18px;
}
.block__title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
}
.seg {
  display: flex;
  gap: 10px;
}
.seg__item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  font-size: 14px;
  color: var(--color-text-primary);
}
.seg__item.on {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}
.appoint-tip {
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.appoint-tip__val {
  color: var(--color-primary);
  font-weight: 600;
}
.pay {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}
.pay:last-child {
  border-bottom: none;
}
.pay__ico {
  font-size: 22px;
}
.pay__name {
  font-size: 15px;
  font-weight: 500;
}
.pay__desc {
  flex: 1;
  text-align: right;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-right: 8px;
}
.pay__radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  margin-left: auto;
}
.pay__desc + .pay__radio {
  margin-left: 0;
}
.pay__radio.on {
  border-color: var(--color-primary);
  background: var(--color-primary);
  box-shadow: inset 0 0 0 3px #fff;
}
.remark {
  font-size: 14px;
  height: 24px;
  width: 100%;
}
.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
.order-item__img {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-image);
  background: var(--gradient-beer-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.order-item__body {
  flex: 1;
  min-width: 0;
}
.order-item__name {
  font-size: 14px;
}
.order-item__spec {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.order-item__price {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 2px;
}
.order-item__qty {
  color: var(--color-text-secondary);
  font-size: 14px;
}
.fee {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-text-primary);
  padding: 6px 0;
}
.fee--cut {
  color: var(--color-danger);
}
.fee--total {
  border-top: 1px solid var(--color-border-light);
  margin-top: 6px;
  padding-top: 12px;
  font-weight: 700;
}
.fee--total .num {
  color: var(--color-primary);
  font-size: 18px;
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
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  z-index: 20;
}
.footbar__total {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.footbar__total .num {
  color: var(--color-primary);
  font-size: 20px;
  font-weight: 700;
}
.footbar__btn {
  background: var(--gradient-primary-btn);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  padding: 0 40px;
  height: 44px;
  line-height: 44px;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-primary-glow);
}
</style>
