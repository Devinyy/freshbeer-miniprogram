<template>
  <view class="page">
      <view class="topbar" :style="{ paddingTop: $statusBarHeight + 'px', height: 44 + $statusBarHeight + 'px' }">
      <view class="topbar__inner">
        <text class="topbar__back" @tap="goBack">‹</text>
        <text class="topbar__title">商品详情</text>
        <fb-icon class="topbar__fav" name="heart" :size="26" :color="fav ? '#E85D4A' : '#2C1810'" @tap="toggleFav" />
      </view>
    </view>

    <scroll-view scroll-y class="content" :show-scrollbar="false">
      <!-- 大图轮播 -->
      <swiper class="hero" :indicator-dots="true" indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#F5A623" :circular="true" :autoplay="false">
        <swiper-item v-for="(img, i) in gallery" :key="i">
          <view class="hero__slide" :style="img.style">
            <image class="hero__product-image" src="/static/products/craft-beer-ipa.png" mode="aspectFit" />
          </view>
        </swiper-item>
      </swiper>
      <view class="hero__tags" v-if="hasTag('cold') || hasTag('new') || isFlash">
        <text v-if="isFlash" class="htag htag--flash">限时秒杀</text>
        <text v-if="hasTag('cold')" class="htag htag--cold">全程冷链</text>
        <text v-if="hasTag('new')" class="htag htag--new">新品</text>
      </view>

      <view class="info">
        <view class="info__name">{{ product.name }}</view>
        <view class="info__sub">{{ subText }}</view>

        <view class="info__price-row">
          <text class="info__price num">¥{{ formatPrice(currentPrice) }}</text>
          <text v-if="showOrigin" class="info__origin num">¥{{ formatPrice(product.price) }}</text>
          <text v-if="product.storagePrice && !isFlash" class="tag-storage">储值专享</text>
        </view>
        <view class="info__storage" v-if="product.storagePrice && !isFlash">
          储值卡支付 ¥{{ formatPrice(product.storagePrice) }} · 立省 ¥{{ formatPrice(product.price - product.storagePrice) }}
        </view>
      </view>

      <!-- 8 项参数 -->
      <view class="section">
        <view class="section__title">商品参数</view>
        <view class="params">
          <view class="param" v-for="(p, i) in paramList" :key="i">
            <text class="param__k">{{ p.k }}</text>
            <text class="param__v num">{{ p.v }}</text>
          </view>
        </view>
      </view>

      <view class="section" v-if="product.desc">
        <view class="section__title">商品介绍</view>
        <view class="desc">{{ product.desc }}</view>
        <view class="desc-tip">未成年人禁止购买酒精饮品 · 适量饮酒，禁止酒驾</view>
      </view>

      <!-- 评价 -->
      <view class="section" v-if="reviews">
        <view class="section__title-row">
          <text class="section__title">用户评价（{{ reviews.count }}）</text>
          <text class="section__more">好评率 {{ reviews.goodRate }}%</text>
        </view>
        <view class="rating-summary">
          <text class="rating-summary__num num">{{ reviews.avg }}</text>
          <view class="rating-summary__body">
            <view class="stars">
              <text v-for="i in 5" :key="i" class="star" :class="{ on: i <= Math.round(reviews.avg) }">★</text>
            </view>
            <text class="rating-summary__tip">综合评分</text>
          </view>
        </view>
        <view class="review" v-for="(r, i) in reviews.list" :key="i">
          <view class="review__head">
            <text class="review__avatar">{{ r.avatar }}</text>
            <text class="review__user">{{ r.user }}</text>
            <view class="review__stars">
              <text v-for="i2 in 5" :key="i2" class="star star--sm" :class="{ on: i2 <= r.rating }">★</text>
            </view>
            <text class="review__date">{{ r.date }}</text>
          </view>
          <view class="review__text">{{ r.text }}</view>
          <view class="review__imgs" v-if="r.imgs">
            <view class="review__img"><fb-icon name="beer" :size="20" color="#C87921" /></view>
            <view class="review__img"><fb-icon name="camera" :size="20" /></view>
          </view>
        </view>
      </view>

      <!-- 搭配推荐 -->
      <view class="section" v-if="recommend.length">
        <view class="section__title">搭配推荐</view>
        <scroll-view scroll-x class="recos" :show-scrollbar="false">
          <view class="reco" v-for="r in recommend" :key="r.id" @tap="goProduct(r)">
            <view class="reco__img" :style="recoStyle(r)">{{ recoEmoji(r) }}</view>
            <text class="reco__name ellipsis-1">{{ r.name }}</text>
            <text class="reco__price num">¥{{ formatPrice(r.storagePrice || r.price) }}</text>
          </view>
        </scroll-view>
      </view>

      <view class="safe" style="height: 86px"></view>
    </scroll-view>

    <view class="footbar">
      <view class="footbar__cart" @tap="goCart">
        <fb-icon name="cart" :size="24" color="#fff" />
        <text v-if="cart.totalCount" class="footbar__badge">{{ cart.totalCount }}</text>
      </view>
      <view class="footbar__btn footbar__btn--ghost" @tap="addToCart">加入购物车</view>
      <view class="footbar__btn footbar__btn--primary" @tap="buyNow">立即购买</view>
    </view>

    <fb-sku-popup
      :show="skuShow"
      :product="product"
      @close="skuShow = false"
      @confirm="onSkuConfirm"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProduct } from '@/services/product'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/utils/format'

const product = ref({})
const reviews = ref(null)
const recommend = ref([])
const skuShow = ref(false)
const fav = ref(false)
const cart = useCartStore()
const systemInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
const statusBarH = ref(systemInfo.statusBarHeight || 0)
const id = ref('')
const mode = ref('add')

onLoad((opts) => {
  id.value = opts.id || ''
  load()
})

async function load() {
  const res = await getProduct(id.value)
  product.value = res.product || {}
  reviews.value = res.reviews || null
  recommend.value = res.recommend || []
}

const isFlash = computed(() => product.value.flashSale)
const hasSpec = computed(
  () =>
    (product.value.specGroups && product.value.specGroups.length > 0) ||
    (product.value.sku && product.value.sku.length > 0)
)
const currentPrice = computed(() =>
  isFlash.value ? product.value.flashPrice : product.value.storagePrice || product.value.price
)
const showOrigin = computed(
  () => isFlash.value || (product.value.storagePrice && product.value.storagePrice < product.value.price)
)
const subText = computed(() => {
  const p = product.value
  if (!p.name) return ''
  const parts = []
  if (p.origin) parts.push(p.origin)
  if (p.abv) parts.push(p.abv + '%vol')
  if (p.volume) parts.push(p.volume)
  return parts.join(' · ')
})
const paramList = computed(() => {
  const p = product.value
  if (!p.name) return []
  return [
    { k: '品牌', v: p.brand || '—' },
    { k: '风格', v: p.style || '—' },
    { k: '产地', v: p.origin || '—' },
    { k: '酒精度', v: p.abv ? p.abv + '%vol' : '无酒精' },
    { k: 'IBU', v: p.ibu || '—' },
    { k: '容量', v: p.volume || '—' },
    { k: '保质期', v: p.shelfLife || '—' },
    { k: '建议温度', v: p.serveTemp || '—' }
  ]
})
const emoji = computed(() => {
  return product.value.categoryId === 'comp' ? 'warning' : 'beer'
})
const gallery = computed(() => {
  const c = product.value.categoryId
  let base = 'background:var(--gradient-beer-glass);'
  if (c === 'whisky') base = 'background:linear-gradient(135deg,#6B4423,#3D2817);'
  if (c === 'soft') base = 'background:linear-gradient(135deg,#A8D5BA,#4CAF50);'
  if (c === 'comp') base = 'background:linear-gradient(135deg,#FFB3A7,#F44336);'
  return [
    { style: base },
    { style: base + 'filter:brightness(1.08);' },
    { style: base + 'filter:brightness(0.92);' }
  ]
})

function recoEmoji(r) {
  return r.categoryId === 'comp' ? 'warning' : 'beer'
}
function recoStyle(r) {
  const c = r.categoryId
  if (c === 'whisky') return 'background:linear-gradient(135deg,#6B4423,#3D2817);'
  if (c === 'soft') return 'background:linear-gradient(135deg,#A8D5BA,#4CAF50);'
  if (c === 'comp') return 'background:linear-gradient(135deg,#FFB3A7,#F44336);'
  return 'background:var(--gradient-beer-glass);'
}
function hasTag(t) {
  return product.value.tags && product.value.tags.includes(t)
}
function toggleFav() {
  fav.value = !fav.value
  uni.showToast({ title: fav.value ? '已收藏' : '已取消', icon: 'none' })
}
function openSku(m) {
  mode.value = m
  skuShow.value = true
}
function addToCart() {
  if (hasSpec.value) {
    openSku('add')
  } else {
    directAdd()
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  }
}
function buyNow() {
  if (hasSpec.value) {
    openSku('buy')
  } else {
    directAdd()
    uni.navigateTo({ url: '/pages/order-confirm/order-confirm' })
  }
}
function directAdd() {
  cart.add({
    productId: product.value.id,
    name: product.value.name,
    price: product.value.price,
    storagePrice: product.value.storagePrice,
    spec: '',
    qty: 1,
    categoryId: product.value.categoryId
  })
}
function onSkuConfirm(p) {
  cart.add({
    productId: p.product.id,
    name: p.product.name,
    price: p.price,
    storagePrice: p.storagePrice,
    spec: p.spec,
    qty: p.qty,
    categoryId: p.product.categoryId
  })
  skuShow.value = false
  if (mode.value === 'buy') {
    uni.navigateTo({ url: '/pages/order-confirm/order-confirm' })
  } else {
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  }
}
function goProduct(r) {
  uni.redirectTo({ url: '/pages/product/product?id=' + r.id })
}
function goCart() {
  uni.switchTab({ url: '/pages/cart/cart' })
}
function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
}
.topbar {
  background: var(--color-bg);
}
.topbar__inner {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  position: relative;
}
.topbar__back {
  font-size: 28px;
  color: var(--color-text-primary);
  width: 32px;
}
.topbar__title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
}
.topbar__fav {
  font-size: 22px;
  color: var(--color-text-secondary);
  width: 32px;
  text-align: right;
}
.topbar__fav.on {
  color: var(--color-danger);
}
.content {
  flex: 1;
  overflow-y: auto;
}
.hero {
  height: 280px;
}
.hero__slide {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero__emoji {
  font-size: 120px;
}
.hero__product-image { width: 230px; height: 230px; }
.hero__tags {
  display: flex;
  gap: 8px;
  padding: 12px 16px 0;
}
.htag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: var(--radius-tag);
}
.htag--cold {
  background: var(--color-cold-chain-bg);
  color: var(--color-cold-chain);
}
.htag--flash {
  background: var(--color-flash-sale-bg);
  color: var(--color-flash-sale);
  font-weight: 700;
}
.htag--new {
  background: var(--color-success-light);
  color: var(--color-success);
}
.info {
  background: var(--color-surface);
  margin: 12px;
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
}
.info__name {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.info__sub {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 6px;
}
.info__price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 12px;
}
.info__price {
  font-family: var(--font-number);
  font-size: var(--text-price-l);
  font-weight: 700;
  color: var(--color-primary);
}
.info__origin {
  font-size: var(--text-caption);
  color: var(--color-text-tertiary);
  text-decoration: line-through;
}
.tag-storage {
  background: var(--color-storage-exclusive-bg);
  color: var(--color-storage-exclusive);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-tag);
}
.info__storage {
  margin-top: 10px;
  font-size: 12px;
  color: var(--color-storage-exclusive);
  background: var(--color-storage-exclusive-bg);
  padding: 8px 10px;
  border-radius: var(--radius-input);
}
.section {
  background: var(--color-surface);
  margin: 12px;
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
}
.section__title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
}
.section__title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section__more {
  font-size: 12px;
  color: var(--color-success);
}
.params {
  display: flex;
  flex-wrap: wrap;
}
.param {
  width: 50%;
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}
.param:nth-child(odd) {
  padding-right: 16px;
}
.param__k {
  color: var(--color-text-secondary);
}
.param__v {
  font-weight: 600;
  color: var(--color-text-primary);
}
.desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
.desc-tip {
  margin-top: 12px;
  font-size: 11px;
  color: var(--color-text-tertiary);
}
.rating-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: 8px;
}
.rating-summary__num {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-primary);
}
.stars {
  display: flex;
  gap: 2px;
}
.star {
  color: var(--color-border);
  font-size: 16px;
}
.star.on {
  color: #ffb400;
}
.star--sm {
  font-size: 12px;
}
.rating-summary__tip {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
  display: block;
}
.review {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}
.review:last-child {
  border-bottom: none;
}
.review__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.review__avatar {
  font-size: 18px;
}
.review__user {
  font-size: 13px;
  font-weight: 600;
}
.review__stars {
  display: flex;
  gap: 1px;
}
.review__date {
  margin-left: auto;
  font-size: 11px;
  color: var(--color-text-tertiary);
}
.review__text {
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 1.6;
  margin-top: 8px;
}
.review__imgs {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.review__img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-image);
  background: var(--color-surface-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.recos {
  white-space: nowrap;
}
.reco {
  display: inline-flex;
  flex-direction: column;
  width: 100px;
  margin-right: 12px;
  vertical-align: top;
}
.reco__img {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-image);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}
.reco__name {
  font-size: 12px;
  margin-top: 6px;
  color: var(--color-text-primary);
}
.reco__price {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 2px;
}
.footbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(56px + env(safe-area-inset-bottom));
  padding: 0 12px env(safe-area-inset-bottom);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 50;
}
.footbar__cart {
  position: relative;
  font-size: 24px;
  width: 40px;
  text-align: center;
}
.footbar__badge {
  position: absolute;
  top: -4px;
  right: 0;
  min-width: 16px;
  height: 16px;
  background: var(--color-danger);
  color: #fff;
  font-size: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.footbar__btn {
  flex: 1;
  height: 44px;
  line-height: 44px;
  text-align: center;
  border-radius: var(--radius-pill);
  font-size: 16px;
  font-weight: 600;
}
.footbar__btn--ghost {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.footbar__btn--primary {
  background: var(--gradient-primary-btn);
  color: #fff;
  box-shadow: var(--shadow-primary-glow);
}
</style>
