<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav" :style="{ paddingTop: $statusBarHeight + 'px' }">
      <view class="nav__bar nav__bar--top" :style="{ height: navTopHeight + 'px', paddingRight: capsuleRight + 'px' }">
        <view class="nav__addr" @tap="goAddress">
          <fb-icon name="location" :size="16" color="#F5A623" />
          <text class="nav__addr-text ellipsis-1">{{ addressText }}</text>
          <text class="nav__arrow">▾</text>
        </view>
      </view>
      <view class="nav__bar nav__bar--search">
        <view class="nav__search" @tap="goSearch"><fb-icon name="search" :size="15" color="#B0A490" /><text class="nav__search-ph">搜索精酿 / 品牌</text></view>
      </view>
    </view>

    <!-- 双栏主体 -->
    <view class="body">
      <fb-category-nav
        :categories="categories"
        :activeId="activeCategory"
        @change="onCategoryChange"
      />
      <scroll-view scroll-y class="list" :show-scrollbar="false">
        <view class="list__inner">
          <fb-product-card
            v-for="(p, i) in products"
            :key="p.id"
            :product="p"
            :index="i"
            @add="onAdd"
            @selectSku="onSelectSku"
            @tap="goProduct"
          />
          <view class="list__placeholder" v-if="products.length === 0">该分类暂未上架商品</view>
          <view style="height: 180rpx"></view>
        </view>
      </scroll-view>
    </view>

    <fb-cart-bar
      :count="cart.totalCount"
      :amount="cart.totalAmount"
      @cart="goCart"
      @checkout="goCheckout"
    />

    <fb-sku-popup
      :show="skuShow"
      :product="skuProduct"
      @close="skuShow = false"
      @confirm="onSkuConfirm"
    />

    <view class="compliance-wrap"><fb-compliance-bar /></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getProducts } from '@/services/product'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import { syncCustomTabBar } from '@/utils/tabbar'

const categories = ref([])
const allProducts = ref([])
const products = ref([])
const activeCategory = ref('')
const skuShow = ref(false)
const skuProduct = ref(null)
const cart = useCartStore()
const user = useUserStore()
const addressText = ref('上海市徐汇区·阳光公寓')
const menuButton = uni.getMenuButtonBoundingClientRect ? uni.getMenuButtonBoundingClientRect() : null
const windowInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
const capsuleRight = menuButton ? Math.max(12, windowInfo.windowWidth - menuButton.left + 8) : 96
// 令定位行的垂直中心与微信胶囊中心对齐，并让第二行搜索框落在胶囊下方。
const navTopHeight = menuButton
  ? Math.max(40, (menuButton.top - (windowInfo.statusBarHeight || 0)) * 2 + menuButton.height)
  : 44

onMounted(async () => {
  try {
    const res = await getProducts()
    categories.value = Array.isArray(res && res.categories) ? res.categories : []
    allProducts.value = Array.isArray(res && res.products) ? res.products : []
    activeCategory.value = categories.value[0] ? categories.value[0].id : ''
    filterProducts()
    if (user.defaultAddress) addressText.value = user.defaultAddress.detail
  } catch (error) {
    console.error('首页商品加载失败', error)
    uni.showToast({ title: '商品加载失败，请重试', icon: 'none' })
  }
})
onShow(() => syncCustomTabBar('pages/index/index'))

function filterProducts() {
  products.value = allProducts.value.filter((p) => p.categoryId === activeCategory.value)
}
function onCategoryChange(id) {
  activeCategory.value = id
  filterProducts()
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
function goProduct(p) {
  uni.navigateTo({ url: '/pages/product/product?id=' + p.id })
}
function goSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}
function goCart() {
  uni.switchTab({ url: '/pages/cart/cart' })
}
function goCheckout() {
  if (!cart.reachMinOrder) {
    goCart()
    return
  }
  uni.navigateTo({ url: '/pages/order-confirm/order-confirm' })
}
function goOrder() {
  uni.switchTab({ url: '/pages/order/order' })
}
function goFav() {
  uni.switchTab({ url: '/pages/profile/profile' })
}
function goAddress() {
  uni.navigateTo({ url: '/pages/location/location' })
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
  overflow: hidden;
}
.nav {
  background: var(--color-bg);
  padding-top: env(safe-area-inset-top);
}
.nav__bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 16rpx;
}
.nav__bar--search { height: 88rpx; padding-top: 0; margin-bottom: 8rpx; }
.nav__addr {
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 220rpx;
  gap: 4rpx;
}
.nav__pin {
  font-size: 28rpx;
}
.nav__addr-text {
  min-width: 0;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}
.nav__arrow {
  font-size: 20rpx;
  color: var(--color-text-secondary);
}
.nav__search {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  background: var(--color-surface);
  border: 2rpx solid var(--color-border);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 12rpx;
}
.nav__search-ico {
  font-size: 28rpx;
  opacity: 0.6;
}
.nav__search-ph {
  font-size: 26rpx;
  color: var(--color-text-tertiary);
}
.body {
  flex: 1;
  display: flex;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}
.list {
  flex: 1;
  min-width: 0;
  background: var(--color-surface);
  border-left: 2rpx solid var(--color-border-light);
}
.list__inner {
  padding: 24rpx;
}
.list__placeholder {
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 26rpx;
  padding: 80rpx 0;
}
.compliance-wrap {
  position: fixed;
  bottom: calc(112rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  background: var(--color-bg);
  z-index: 10;
}
</style>
