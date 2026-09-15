<template>
  <view class="page">
    <view class="nav">
      <view class="nav__bar nav__bar--title" :style="{ paddingTop: statusBarH + 'px', paddingRight: capsuleRight + 'px' }">
        <text class="nav__title">全部分类</text>
      </view>
      <view class="nav__bar nav__bar--search">
        <view class="nav__search" @tap="goSearch">
          <fb-icon name="search" :size="17" color="#8B7D6B" />
          <text class="nav__search-ph">搜索精酿 / 品牌</text>
        </view>
      </view>
    </view>

    <view class="body">
      <fb-category-nav
        :categories="categories"
        :activeId="activeCategory"
        @change="onCategoryChange"
      />
      <scroll-view scroll-y class="list" :show-scrollbar="false">
        <view class="list__inner">
          <fb-product-card
            v-for="p in products"
            :key="p.id"
            :product="p"
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
      @checkout="goCart"
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
import { syncCustomTabBar } from '@/utils/tabbar'

const categories = ref([])
const allProducts = ref([])
const products = ref([])
const activeCategory = ref('')
const skuShow = ref(false)
const skuProduct = ref(null)
const cart = useCartStore()
const systemInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
const statusBarH = ref(systemInfo.statusBarHeight || 0)
const menuButton = uni.getMenuButtonBoundingClientRect ? uni.getMenuButtonBoundingClientRect() : null
const capsuleRight = menuButton ? Math.max(12, systemInfo.windowWidth - menuButton.left + 8) : 96

onMounted(async () => {
  const res = await getProducts()
  categories.value = res.categories
  allProducts.value = res.products
  activeCategory.value = res.categories[0].id
  filterProducts()
})
onShow(() => syncCustomTabBar('pages/category/category'))

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
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 24rpx;
}
.nav__bar--title { height: 72rpx; }
.nav__bar--search { height: 88rpx; padding-top: 0; }
.nav__title {
  font-size: 34rpx;
  font-weight: 600;
}
.nav__search {
  flex: 1;
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
}
.list {
  flex: 1;
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
