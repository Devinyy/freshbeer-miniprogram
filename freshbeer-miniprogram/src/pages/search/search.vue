<template>
  <view class="page">
    <view class="nav">
      <view class="nav__bar" :style="{ paddingTop: statusBarH + 'px', paddingRight: capsuleRight + 'px' }">
        <text class="nav__back" @tap="goBack">‹</text>
        <view class="nav__search">
          <fb-icon class="nav__ico" name="search" :size="18" />
          <input
            class="nav__input"
            v-model="keyword"
            placeholder="搜索精酿 / 品牌"
            confirm-type="search"
            @input="onInput"
            @confirm="doSearch"
            focus
          />
          <fb-icon v-if="keyword" class="nav__clear" name="close" :size="18" @tap="clearKw" />
        </view>
        <text class="nav__cancel" @tap="goBack">取消</text>
      </view>
    </view>

    <!-- 联想词下拉 -->
    <scroll-view scroll-y class="suggest" v-if="suggestions.length && !searched">
      <view class="suggest__item" v-for="(s, i) in suggestions" :key="i" @tap="quick(s.name)">
        <fb-icon class="suggest__ico" name="search" :size="18" />
        <rich-text class="suggest__text" :nodes="highlight(s.name)"></rich-text>
        <text class="suggest__sub num">¥{{ formatPrice(s.storagePrice || s.price) }}</text>
      </view>
    </scroll-view>

    <scroll-view scroll-y class="content" v-else-if="!searched">
      <view class="hot">
        <view class="section-title">热搜榜</view>
        <view class="chips">
          <view class="chip" v-for="(h, i) in hot" :key="i" @tap="quick(h)">
            <text class="chip__rank" :class="{ 'chip__rank--top': i < 3 }">{{ i + 1 }}</text>
            {{ h }}
          </view>
        </view>
      </view>
      <view class="history" v-if="history.length">
        <view class="section-title">
          搜索历史
          <view class="history__clear" @tap="clearHistory"><fb-icon name="trash" :size="16" />清空</view>
        </view>
        <view class="chips">
          <view class="chip" v-for="(h, i) in history" :key="i" @tap="quick(h)">{{ h }}</view>
        </view>
      </view>
    </scroll-view>

    <view class="result" v-else>
      <view class="sortbar">
        <view
          class="sortbar__item"
          v-for="s in sorts"
          :key="s.key"
          :class="{ on: sortKey === s.key }"
          @tap="setSort(s.key)"
        >
          {{ s.label }}
          <text v-if="s.key === 'price'" class="sortbar__arrow">{{
            sortKey === 'price' ? (priceAsc ? '↑' : '↓') : '↕'
          }}</text>
        </view>
      </view>
      <scroll-view scroll-y class="result__list">
        <view class="result-tip">找到 {{ sortedResults.length }} 个商品</view>
        <fb-product-card
          v-for="p in sortedResults"
          :key="p.id"
          :product="p"
          @tap="goProduct"
          @add="onAdd"
          @selectSku="onSelectSku"
        />
        <view class="empty" v-if="!sortedResults.length">没有找到相关商品</view>
        <view style="height: 90px"></view>
      </scroll-view>
    </view>

    <fb-sku-popup
      :show="skuShow"
      :product="skuProduct"
      @close="skuShow = false"
      @confirm="onSkuConfirm"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProducts } from '@/services/product'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/utils/format'

const keyword = ref('')
const searched = ref(false)
const results = ref([])
const suggestions = ref([])
const history = ref(['鹅岛', '福佳白', '威士忌', '林德曼'])
const hot = ['精酿生啤', 'IPA', '福佳白', '山崎', '罗斯福10号', '鲜啤']
const allProducts = ref([])
const skuShow = ref(false)
const skuProduct = ref(null)
const cart = useCartStore()
const systemInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
const statusBarH = ref(systemInfo.statusBarHeight || 0)
const menuButton = uni.getMenuButtonBoundingClientRect ? uni.getMenuButtonBoundingClientRect() : null
const capsuleRight = menuButton ? Math.max(12, systemInfo.windowWidth - menuButton.left + 8) : 96

const sorts = [
  { key: 'default', label: '综合' },
  { key: 'sales', label: '销量' },
  { key: 'price', label: '价格' },
  { key: 'rating', label: '评分' }
]
const sortKey = ref('default')
const priceAsc = ref(true)

onMounted(async () => {
  const res = await getProducts()
  allProducts.value = res.products
})

function match(p, kw) {
  return (
    p.name.indexOf(kw) >= 0 ||
    (p.origin && p.origin.indexOf(kw) >= 0) ||
    (p.brand && p.brand.indexOf(kw) >= 0) ||
    (p.style && p.style.indexOf(kw) >= 0)
  )
}
function onInput() {
  const kw = keyword.value.trim()
  searched.value = false
  if (!kw) {
    suggestions.value = []
    return
  }
  suggestions.value = allProducts.value.filter((p) => match(p, kw)).slice(0, 8)
}
function highlight(name) {
  const kw = keyword.value.trim()
  if (!kw) return name
  return name.split(kw).join(`<span style="color:#F5A623">${kw}</span>`)
}
function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) return
  results.value = allProducts.value.filter((p) => match(p, kw))
  searched.value = true
  suggestions.value = []
  if (!history.value.includes(kw)) history.value.unshift(kw)
}
const sortedResults = computed(() => {
  const arr = results.value.slice()
  if (sortKey.value === 'price') {
    arr.sort((a, b) => {
      const pa = a.storagePrice || a.price
      const pb = b.storagePrice || b.price
      return priceAsc.value ? pa - pb : pb - pa
    })
  } else if (sortKey.value === 'sales') {
    arr.sort((a, b) => (b.tags.includes('hot') ? 1 : 0) - (a.tags.includes('hot') ? 1 : 0))
  } else if (sortKey.value === 'rating') {
    arr.sort((a, b) => (b.tags.includes('new') ? 1 : 0) - (a.tags.includes('new') ? 1 : 0))
  }
  return arr
})
function setSort(key) {
  if (key === 'price') {
    if (sortKey.value === 'price') priceAsc.value = !priceAsc.value
    else priceAsc.value = true
  }
  sortKey.value = key
}
function quick(kw) {
  keyword.value = kw
  doSearch()
}
function clearKw() {
  keyword.value = ''
  searched.value = false
  suggestions.value = []
}
function clearHistory() {
  history.value = []
}
function goProduct(p) {
  uni.navigateTo({ url: '/pages/product/product?id=' + p.id })
}
function onAdd(product) {
  cart.add({
    productId: product.id,
    name: product.name,
    price: product.price,
    storagePrice: product.storagePrice,
    spec: '',
    qty: 1,
    categoryId: product.categoryId
  })
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}
function onSelectSku(product) {
  skuProduct.value = product
  skuShow.value = true
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
  uni.showToast({ title: '已加入购物车', icon: 'success' })
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
.nav {
  background: var(--color-bg);
}
.nav__bar {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
}
.nav__back {
  font-size: 26px;
  color: var(--color-text-primary);
}
.nav__search {
  flex: 1;
  height: 36px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 6px;
}
.nav__ico {
  font-size: 14px;
  opacity: 0.6;
}
.nav__input {
  flex: 1;
  font-size: 14px;
}
.nav__clear {
  font-size: 14px;
  color: var(--color-text-tertiary);
}
.nav__cancel {
  font-size: 14px;
  color: var(--color-primary);
}
.suggest {
  flex: 1;
  background: var(--color-surface);
}
.suggest__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--color-border-light);
}
.suggest__ico {
  font-size: 14px;
  opacity: 0.5;
}
.suggest__text {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-primary);
}
.suggest__sub {
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 700;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.history__clear {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 400;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.chip {
  padding: 8px 16px;
  background: var(--color-surface);
  border-radius: var(--radius-pill);
  font-size: 13px;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 6px;
}
.chip__rank {
  font-family: var(--font-number);
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 700;
}
.chip__rank--top {
  color: var(--color-flash-sale);
}
.result {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.sortbar {
  display: flex;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
}
.sortbar__item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}
.sortbar__item.on {
  color: var(--color-primary);
  font-weight: 700;
}
.sortbar__arrow {
  font-size: 11px;
}
.result__list {
  flex: 1;
  min-height: 0;
  padding: 12px 16px;
}
.result-tip {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}
.empty {
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 14px;
  padding: 40px 0;
}
</style>
