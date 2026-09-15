<template>
  <view class="page"><fb-page-nav title="商品管理" /><view v-if="!user.isAdmin" class="empty">无管理权限</view><template v-else><view class="toolbar"><button class="add" @tap="edit()">新增商品</button></view><scroll-view scroll-y class="content"><view v-for="p in products" :key="p.id || p._id" class="product card"><view><text class="name">{{ p.name }}</text><text class="meta">¥{{ p.price }} · 库存 {{ p.stock }} · {{ p.onSale ? '在售' : '已下架' }}</text></view><view class="actions"><text @tap="edit(p)">编辑</text><text @tap="toggle(p)">{{ p.onSale ? '下架' : '上架' }}</text><text class="danger" @tap="remove(p)">删除</text></view></view><view v-if="!products.length" class="empty">暂无商品</view></scroll-view></template></view>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { listAdminProducts, setProductOnSale, deleteProduct } from '@/services/admin'
const user = useUserStore(); const products = ref([])
const identity = () => ({ openid: user.profile.openid, phone: user.profile.phone })
async function load() { if (!user.isAdmin) return; const r = await listAdminProducts(identity()); products.value = r.products || [] }
function edit(p) { uni.navigateTo({ url: `/pages/admin-product-edit/admin-product-edit${p ? `?id=${p.id || p._id}` : ''}` }) }
async function toggle(p) { await setProductOnSale({ ...identity(), id: p.id || p._id, onSale: !p.onSale }); load() }
function remove(p) { uni.showModal({ title: '删除商品', content: '商品将下架且不再对用户展示', success: async r => { if (r.confirm) { await deleteProduct({ ...identity(), id: p.id || p._id }); load() } } }) }
onMounted(load); onShow(load)
</script>
<style scoped>.page{height:100vh;display:flex;flex-direction:column;background:var(--color-bg)}.toolbar{padding:12px 16px 0}.add{margin:0;background:var(--color-primary);color:#fff;font-size:14px}.content{flex:1;padding:12px}.product{padding:14px;margin-bottom:10px}.name,.meta{display:block}.name{font-weight:600}.meta{margin-top:6px;color:var(--color-text-secondary);font-size:12px}.actions{display:flex;gap:14px;margin-top:12px;color:var(--color-primary);font-size:13px}.danger{color:var(--color-danger)}.empty{padding:40px;text-align:center;color:var(--color-text-secondary)}</style>
