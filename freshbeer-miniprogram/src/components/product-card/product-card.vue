<template>
  <view class="card" :class="{ 'card--soldout': soldOut }" @tap="onTap">
    <view class="card__img" :style="imgStyle">
      <image class="card__product-image" src="/static/products/craft-beer-ipa.png" mode="aspectFit" />
      <view v-if="soldOut" class="card__soldout">售罄</view>
    </view>
    <view class="card__body">
      <view class="card__title-row">
        <text v-if="index !== undefined" class="card__number num">{{ String(index + 1).padStart(2, '0') }}</text>
        <view class="card__title ellipsis-1">{{ product.name }}</view>
      </view>
      <view class="card__sub ellipsis-1">{{ subText }}</view>

      <view class="card__tags">
        <text v-if="isFlash" class="tag tag--flash">秒杀</text>
        <text v-else-if="product.storagePrice" class="tag-storage">储值专享</text>
        <text v-if="hasTag('cold')" class="tag tag--cold">冷链</text>
        <text v-if="hasTag('hot')" class="tag tag--hot">热销</text>
        <text v-if="hasTag('new')" class="tag tag--new">新品</text>
      </view>

      <view class="card__bottom">
        <view class="price-box">
          <text class="price num" :class="{ 'price--flash': isFlash }"
            >¥{{ formatPrice(displayPrice) }}</text
          >
          <text v-if="showOrigin" class="price origin num"
            >¥{{ formatPrice(product.price) }}</text
          >
        </view>
        <view class="action">
          <text v-if="soldOut" class="btn-disabled">已售罄</text>
          <view v-else-if="hasSpec" class="btn-spec" @tap.stop="onSelectSku">选规格</view>
          <view v-else-if="cartQty > 0" class="stepper" @tap.stop>
            <view class="stepper__btn" @tap.stop="decr">－</view>
            <text class="stepper__num num">{{ cartQty }}</text>
            <view class="stepper__btn stepper__btn--add" @tap.stop="incr">＋</view>
          </view>
          <view v-else class="btn-add" @tap.stop="onAdd">＋</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { formatPrice } from '@/utils/format'
import { useCartStore } from '@/store/cart'

const props = defineProps({
  product: { type: Object, required: true },
  index: { type: Number, default: undefined }
})
const emit = defineEmits(['add', 'selectSku', 'tap'])

const cart = useCartStore()

const isFlash = computed(() => props.product.flashSale)
const hasSpec = computed(
  () =>
    (props.product.specGroups && props.product.specGroups.length > 0) ||
    (props.product.sku && props.product.sku.length > 0)
)
const soldOut = computed(() => props.product.stock !== undefined && props.product.stock <= 0)
const cartItem = computed(() =>
  cart.items.find((i) => i.productId === props.product.id && !i.spec)
)
const cartQty = computed(() => (cartItem.value ? cartItem.value.qty : 0))
const displayPrice = computed(() =>
  isFlash.value
    ? props.product.flashPrice
    : props.product.storagePrice || props.product.price
)
const showOrigin = computed(
  () => isFlash.value || (props.product.storagePrice && props.product.storagePrice < props.product.price)
)

const subText = computed(() => {
  const p = props.product
  const parts = []
  if (p.origin) parts.push(p.origin)
  if (p.abv) parts.push(p.abv + '%vol')
  if (p.volume) parts.push(p.volume)
  return parts.join(' · ')
})

const imageLabel = computed(() => {
  const name = props.product.name || ''
  if (name.includes('福佳白')) return '福佳白'
  if (name.includes('朋克')) return '朋克 IPA'
  if (name.includes('鹅岛') || name.includes('IPA')) return 'IPA'
  if (name.includes('京A')) return '京A'
  if (name.includes('林德曼')) return '林德曼'
  if (props.product.categoryId === 'whisky') return '威士忌'
  if (props.product.categoryId === 'snack') return '佐酒小食'
  if (props.product.categoryId === 'soft') return '无酒精'
  if (props.product.categoryId === 'comp') return '赔付'
  return '鲜啤'
})

const imgStyle = computed(() => {
  const c = props.product.categoryId
  if (c === 'whisky') return 'background:linear-gradient(135deg,#6B4423,#3D2817);'
  if (c === 'soft') return 'background:linear-gradient(135deg,#A8D5BA,#4CAF50);'
  if (c === 'comp') return 'background:linear-gradient(135deg,#FFB3A7,#F44336);'
  return 'background:var(--gradient-beer-glass);'
})

function hasTag(t) {
  return props.product.tags && props.product.tags.includes(t)
}
function onAdd() {
  if (soldOut.value) return
  emit('add', props.product)
}
function onSelectSku() {
  if (soldOut.value) return
  emit('selectSku', props.product)
}
function incr() {
  if (cartItem.value) cart.updateQty(cartItem.value.key, cartItem.value.qty + 1)
}
function decr() {
  if (cartItem.value) cart.updateQty(cartItem.value.key, cartItem.value.qty - 1)
}
function onTap() {
  emit('tap', props.product)
}
</script>

<style scoped>
.card {
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  gap: var(--space-sm);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: var(--space-card-padding);
  box-shadow: var(--shadow-card);
  margin-bottom: var(--space-sm);
}
.card__img {
  width: 160rpx;
  height: 160rpx;
  border-radius: var(--radius-image);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card__product-image { width: 144rpx; height: 144rpx; }
.card__emoji {
  font-size: 72rpx;
}
.card__img-label {
  color: rgba(255, 248, 240, 0.95);
  font-size: 30rpx;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
}
.card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.card__title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}
.card__title-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  min-width: 0;
}
.card__number {
  flex-shrink: 0;
  font-size: 24rpx;
  color: var(--color-text-tertiary);
  font-weight: 700;
}
.card__sub {
  font-size: var(--text-caption);
  color: var(--color-text-secondary);
  margin-top: 4rpx;
}
.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}
.tag,
.tag-storage {
  font-size: var(--text-micro);
  border-radius: var(--radius-tag);
  padding: 4rpx 12rpx;
  line-height: 1.4;
}
.tag--cold {
  background: var(--color-cold-chain-bg);
  color: var(--color-cold-chain);
}
.tag--hot {
  background: #ffe5e0;
  color: #ff5722;
}
.tag--new {
  background: var(--color-success-light);
  color: var(--color-success);
}
.tag--flash {
  background: var(--color-flash-sale-bg);
  color: var(--color-flash-sale);
  font-weight: 700;
}
.tag-storage {
  background: var(--color-storage-exclusive-bg);
  color: var(--color-storage-exclusive);
}
.card__bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12rpx;
  min-width: 0;
}
.price-box {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  min-width: 0;
  overflow: hidden;
}
.price {
  flex-shrink: 0;
  font-family: var(--font-number);
  font-weight: 700;
  font-size: var(--text-price-m);
  color: var(--color-primary);
}
.price--flash {
  color: var(--color-flash-sale);
}
.price.origin {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-caption);
  color: var(--color-text-tertiary);
  text-decoration: line-through;
  font-weight: 400;
}
.btn-add {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-add:active {
  opacity: 0.8;
  transform: scale(0.92);
}
.btn-spec {
  height: 56rpx;
  padding: 0 24rpx;
  border: 2rpx solid var(--color-primary);
  border-radius: var(--radius-button);
  color: var(--color-primary);
  font-size: var(--text-caption);
  display: flex;
  align-items: center;
}
.btn-spec:active {
  background: var(--color-primary-light);
}
.stepper {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.stepper__btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 2rpx solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: var(--color-text-secondary);
}
.stepper__btn--add {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
.stepper__num {
  font-size: var(--text-body);
  min-width: 36rpx;
  text-align: center;
}
.card--soldout {
  opacity: 0.72;
}
.card__soldout {
  position: absolute;
  inset: 0;
  background: rgba(44, 24, 16, 0.45);
  border-radius: var(--radius-image);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}
.card__img {
  position: relative;
}
.btn-disabled {
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: var(--radius-button);
  background: var(--color-surface-alt);
  color: var(--color-text-tertiary);
  font-size: var(--text-caption);
  display: flex;
  align-items: center;
}
</style>
