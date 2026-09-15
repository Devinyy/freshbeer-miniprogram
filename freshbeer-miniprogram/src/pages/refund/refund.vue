<template>
  <view class="page">
    <fb-page-nav title="申请退款" />

    <scroll-view scroll-y class="content">
      <view v-if="order" class="order-card card">
        <view class="order-card__head">
          <text class="order-card__title">退款订单</text>
          <text class="order-card__id num">#{{ order.orderId }}</text>
        </view>
        <view class="order-card__item" v-for="item in order.items" :key="item.productId + item.spec">
          <text class="order-card__name ellipsis-1">{{ item.name }}</text>
          <text class="order-card__qty num">×{{ item.qty }}</text>
          <text class="order-card__price num">¥{{ formatPrice(item.price * item.qty) }}</text>
        </view>
        <view class="order-card__total"><text>可退金额</text><text class="num">¥{{ formatPrice(order.payable) }}</text></view>
      </view>

      <view class="card section">
        <view class="section__title">退款原因</view>
        <view
          v-for="item in reasons"
          :key="item"
          class="reason"
          :class="{ on: reason === item }"
          @tap="reason = item"
        >
          <text>{{ item }}</text>
          <view class="radio" :class="{ on: reason === item }"></view>
        </view>
      </view>

      <view class="card section">
        <view class="section__title">补充说明 <text class="optional">（选填）</text></view>
        <textarea v-model="note" class="note" maxlength="200" placeholder="请描述退款原因，便于商家快速处理" />
      </view>

      <view class="notice">退款申请提交后，商家将在 1-3 个工作日内审核。审核通过后原路退回支付账户。</view>
      <view style="height: 100px"></view>
    </scroll-view>

    <view class="footbar">
      <view class="footbar__btn" :class="{ disabled: !canSubmit || submitting }" @tap="submit">
        {{ submitting ? '提交中…' : '提交退款申请' }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrder } from '@/services/delivery'
import { refundOrder } from '@/services/refund'
import { formatPrice } from '@/utils/format'

const order = ref(null)
const reason = ref('')
const note = ref('')
const submitting = ref(false)
const reasons = ['不想要了', '商品破损', '商品少发 / 漏发', '配送超时', '其他原因']
const canSubmit = computed(() => !!order.value && !!reason.value)

onLoad(async (opts) => {
  if (!opts.orderId) return
  const res = await getOrder(opts.orderId)
  order.value = res.order
})

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  try {
    const res = await refundOrder({
      orderId: order.value.orderId,
      amount: order.value.payable,
      reason: reason.value,
      note: note.value.trim()
    })
    if (!res || !res.order) throw new Error('退款申请失败')
    uni.showToast({ title: '申请已提交', icon: 'success' })
    setTimeout(() => uni.redirectTo({ url: '/pages/order-detail/order-detail?orderId=' + order.value.orderId }), 700)
  } catch (e) {
    uni.showToast({ title: e.message || '退款申请失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }
.nav { height: 44px; display: flex; align-items: center; padding: 0 16px; }
.nav__title { font-size: 17px; font-weight: 600; }
.content { flex: 1; min-height: 0; padding: 12px 16px; box-sizing: border-box; }
.card { background: var(--color-surface); border-radius: var(--radius-card); padding: 16px; margin-bottom: 12px; box-shadow: var(--shadow-card); }
.order-card__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-light); }
.order-card__title { font-size: 15px; font-weight: 700; }
.order-card__id { color: var(--color-text-secondary); font-size: 12px; }
.order-card__item { display: flex; align-items: center; gap: 8px; padding-top: 12px; font-size: 13px; }
.order-card__name { flex: 1; min-width: 0; }
.order-card__qty { color: var(--color-text-secondary); }
.order-card__price { width: 64px; text-align: right; }
.order-card__total { display: flex; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--color-border-light); color: var(--color-text-secondary); font-size: 13px; }
.order-card__total .num { color: var(--color-primary); font-size: 18px; font-weight: 700; }
.section { padding: 4px 16px; }
.section__title { padding: 12px 0; font-size: 15px; font-weight: 700; }
.optional { color: var(--color-text-tertiary); font-size: 12px; font-weight: 400; }
.reason { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-top: 1px solid var(--color-border-light); font-size: 14px; }
.radio { width: 18px; height: 18px; border: 2px solid var(--color-border); border-radius: 50%; box-sizing: border-box; }
.radio.on { border-color: var(--color-primary); box-shadow: inset 0 0 0 4px var(--color-surface); background: var(--color-primary); }
.note { width: 100%; height: 92px; padding: 10px 0 14px; font-size: 13px; box-sizing: border-box; }
.notice { color: var(--color-text-tertiary); font-size: 11px; line-height: 1.6; padding: 0 4px; }
.footbar { position: fixed; left: 0; right: 0; bottom: 0; padding: 8px 16px calc(8px + env(safe-area-inset-bottom)); background: var(--color-surface); box-shadow: 0 -2px 8px rgba(44,24,16,.06); }
.footbar__btn { height: 44px; line-height: 44px; text-align: center; border-radius: var(--radius-pill); background: var(--gradient-primary-btn); color: #fff; font-size: 16px; font-weight: 600; }
.footbar__btn.disabled { opacity: .45; }
</style>
