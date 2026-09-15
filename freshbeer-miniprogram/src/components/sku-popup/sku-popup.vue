<template>
  <view v-if="show" class="mask" @tap="$emit('close')">
    <view class="sheet" @tap.stop>
      <view class="sheet__head">
        <view class="sheet__thumb"><fb-icon :name="emoji" :size="42" color="#C87921" /></view>
        <view class="sheet__head-info">
          <view class="sheet__name ellipsis-1">{{ product.name }}</view>
          <view class="sheet__price-row">
            <text class="sheet__price num">¥{{ formatPrice(currentPrice) }}</text>
            <text v-if="currentStoragePrice && currentStoragePrice < currentPrice" class="sheet__storage num"
              >储值 ¥{{ formatPrice(currentStoragePrice) }}</text
            >
          </view>
          <view class="sheet__selected ellipsis-1" v-if="selectedText">已选：{{ selectedText }}</view>
        </view>
        <view class="sheet__close" @tap="$emit('close')"><fb-icon name="close" :size="20" /></view>
      </view>

      <scroll-view scroll-y class="sheet__body">
        <view v-for="g in specGroups" :key="g.key" class="group">
          <view class="group__title">{{ g.title }}</view>
          <view class="group__opts">
            <view
              v-for="(o, oi) in g.options"
              :key="oi"
              class="opt"
              :class="{ 'opt--active': selected[g.key] === oi }"
              @tap="selected[g.key] = oi"
            >
              {{ o.label }}
              <text v-if="o.delta" class="opt__price num">+{{ o.delta }}</text>
            </view>
          </view>
        </view>

        <view class="group">
          <view class="group__title">购买数量</view>
          <view class="stepper">
            <view class="stepper__btn" @tap="decr">－</view>
            <text class="stepper__num num">{{ qty }}</text>
            <view class="stepper__btn" @tap="incr">＋</view>
          </view>
        </view>

        <view class="storage-tip" v-if="currentStoragePrice && currentStoragePrice < currentPrice">
          储值卡支付立享专享价，本单可省 ¥{{ formatPrice((currentPrice - currentStoragePrice) * qty) }}
        </view>

        <view style="height: 12px"></view>
      </scroll-view>

      <view class="sheet__foot">
        <view class="sheet__total">
          合计 <text class="num">¥{{ formatPrice(total) }}</text>
        </view>
        <view class="sheet__add" @tap="onConfirm">加入购物车</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { formatPrice } from '@/utils/format'

const props = defineProps({
  show: { type: Boolean, default: false },
  product: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['close', 'confirm'])

const qty = ref(1)
const selected = reactive({})

const specGroups = computed(() => props.product.specGroups || [])

const totalDelta = computed(() =>
  specGroups.value.reduce((sum, g) => {
    const idx = selected[g.key]
    const opt = g.options[idx]
    return sum + (opt ? opt.delta || 0 : 0)
  }, 0)
)
const currentPrice = computed(() => Number(props.product.price || 0) + totalDelta.value)
const currentStoragePrice = computed(() => {
  if (!props.product.storagePrice) return 0
  return Number(props.product.storagePrice) + totalDelta.value
})
const selectedText = computed(() =>
  specGroups.value
    .map((g) => (g.options[selected[g.key]] ? g.options[selected[g.key]].label : ''))
    .filter(Boolean)
    .join(' / ')
)
const total = computed(() => currentPrice.value * qty.value)
const emoji = computed(() => {
  return props.product.categoryId === 'comp' ? 'warning' : 'beer'
})

function resetSelection() {
  qty.value = 1
  specGroups.value.forEach((g) => {
    selected[g.key] = 0
  })
}

watch(
  () => props.show,
  (v) => {
    if (v) resetSelection()
  }
)
watch(
  () => props.product && props.product.id,
  () => {
    if (props.show) resetSelection()
  }
)

function incr() {
  qty.value++
}
function decr() {
  if (qty.value > 1) qty.value--
}
function onConfirm() {
  emit('confirm', {
    product: props.product,
    spec: selectedText.value,
    price: currentPrice.value,
    storagePrice: currentStoragePrice.value || currentPrice.value,
    qty: qty.value
  })
}
</script>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  /* SKU sheet must sit above the custom tab bar while it is open. */
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}
.sheet {
  width: 100%;
  max-height: 75vh;
  background: var(--color-surface);
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(env(safe-area-inset-bottom));
}
.sheet__head {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  position: relative;
}
.sheet__thumb {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-image);
  background: var(--gradient-beer-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  flex-shrink: 0;
}
.sheet__head-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}
.sheet__name {
  font-size: var(--text-body-l);
  font-weight: 600;
}
.sheet__price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 4px;
}
.sheet__price {
  color: var(--color-primary);
  font-size: var(--text-price-l);
  font-weight: 700;
}
.sheet__storage {
  font-size: var(--text-caption);
  color: var(--color-storage-exclusive);
  background: var(--color-storage-exclusive-bg);
  padding: 1px 6px;
  border-radius: var(--radius-tag);
}
.sheet__selected {
  font-size: var(--text-caption);
  color: var(--color-text-secondary);
  margin-top: 4px;
}
.sheet__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 18px;
}
.sheet__body {
  flex: 1;
  padding: 0 var(--space-md);
  overflow-y: auto;
}
.group {
  margin-top: var(--space-md);
}
.group__title {
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 10px;
}
.group__opts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.opt {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  font-size: var(--text-body);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}
.opt--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}
.opt__price {
  font-size: var(--text-caption);
  color: var(--color-text-secondary);
}
.stepper {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stepper__btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--color-text-secondary);
}
.stepper__num {
  font-size: var(--text-body-l);
  min-width: 24px;
  text-align: center;
}
.storage-tip {
  margin-top: var(--space-md);
  font-size: var(--text-caption);
  color: var(--color-storage-exclusive);
  background: var(--color-storage-exclusive-bg);
  padding: 8px 12px;
  border-radius: var(--radius-input);
  line-height: 1.5;
}
.sheet__foot {
  display: flex;
  align-items: center;
  padding: 12px var(--space-md);
  border-top: 1px solid var(--color-border-light);
  gap: 12px;
}
.sheet__total {
  flex: 1;
  font-size: var(--text-body);
  color: var(--color-text-primary);
}
.sheet__total .num {
  color: var(--color-primary);
  font-size: var(--text-price-l);
  font-weight: 700;
}
.sheet__add {
  background: var(--gradient-primary-btn);
  color: #fff;
  font-size: var(--text-body-l);
  font-weight: 600;
  padding: 0 32px;
  height: 44px;
  line-height: 44px;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-primary-glow);
}
</style>
