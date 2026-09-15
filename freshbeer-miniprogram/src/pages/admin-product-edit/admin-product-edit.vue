<template>
  <view class="page"><fb-page-nav :title="isEdit ? '编辑商品' : '新增商品'" /><view v-if="!user.isAdmin" class="empty">无管理权限</view><scroll-view v-else scroll-y class="content"><view class="form card"><view v-for="field in fields" :key="field.key" class="row"><text class="label">{{ field.label }}</text><input v-model="form[field.key]" :type="field.type || 'text'" :placeholder="field.placeholder" /></view><view class="row"><text class="label">在售</text><switch :checked="form.onSale" color="#c87921" @change="form.onSale = $event.detail.value" /></view></view><button class="save" @tap="save">保存</button></scroll-view></view>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { createProduct, updateProduct, listAdminProducts } from '@/services/admin'
const user = useUserStore(); const isEdit = ref(false); const productId = ref('')
const form = reactive({ name: '', category: 'beer', price: '', stock: '', origin: '', abv: '', volume: '', description: '', onSale: true })
const fields = [{ key: 'name', label: '商品名称', placeholder: '请输入商品名称' },{ key: 'category', label: '分类', placeholder: '如 beer' },{ key: 'price', label: '售价', type: 'digit', placeholder: '0.00' },{ key: 'stock', label: '库存', type: 'number', placeholder: '0' },{ key: 'origin', label: '产地', placeholder: '如 中国·上海' },{ key: 'abv', label: '酒精度', placeholder: '如 4.5%vol' },{ key: 'volume', label: '规格', placeholder: '如 500ml' },{ key: 'description', label: '商品描述', placeholder: '选填' }]
const identity = () => ({ openid: user.profile.openid, phone: user.profile.phone })
onLoad(async query => { if (!query.id || !user.isAdmin) return; isEdit.value = true; productId.value = query.id; const r = await listAdminProducts(identity()); const p = (r.products || []).find(x => (x.id || x._id) === query.id); if (p) Object.assign(form, p) })
async function save() { if (!form.name.trim() || Number(form.price) < 0 || form.stock === '') return uni.showToast({ title: '请填写名称、售价和库存', icon: 'none' }); const payload = { ...form, price: Number(form.price), stock: Number(form.stock), ...identity() }; if (isEdit.value) await updateProduct({ ...payload, id: productId.value }); else await createProduct(payload); uni.showToast({ title: '保存成功', icon: 'success' }); setTimeout(() => uni.navigateBack(), 500) }
</script>
<style scoped>.page{height:100vh;display:flex;flex-direction:column;background:var(--color-bg)}.content{flex:1;padding:24rpx 32rpx}.form{padding:0}.row{display:flex;align-items:center;min-height:100rpx;border-bottom:2rpx solid var(--color-border-light);padding:0 24rpx}.row:last-child{border:0}.label{width:144rpx;font-size:28rpx}.row input{flex:1;text-align:right;font-size:28rpx}.save{margin-top:40rpx;background:var(--color-primary);color:#fff}.empty{padding:80rpx;text-align:center;color:var(--color-text-secondary)}</style>
