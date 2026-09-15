<template>
  <view class="page">
    <fb-page-nav :title="isEdit ? '编辑地址' : '新增地址'" />

    <scroll-view scroll-y class="content">
      <view class="form card">
        <view class="field">
          <text class="field__label">联系人</text>
          <input class="field__input" v-model="form.name" placeholder="收货人姓名" />
        </view>
        <view class="field">
          <text class="field__label">手机号</text>
          <input class="field__input" v-model="form.phone" type="number" maxlength="11" placeholder="11 位手机号" />
        </view>
        <view class="field">
          <text class="field__label">收货地址</text>
          <view class="field__map" @tap="pickOnMap">地图选点 ›</view>
        </view>
        <view class="field field--col">
          <textarea class="field__area" v-model="form.detail" placeholder="街道、门牌号、楼层（详细地址）" />
        </view>
      </view>

      <view class="tags card">
        <text class="tags__label">标签</text>
        <view class="tags__opts">
          <view
            class="tag-opt"
            v-for="t in tagOpts"
            :key="t"
            :class="{ on: form.tag === t }"
            @tap="form.tag = t"
          >{{ t }}</view>
        </view>
      </view>

      <view class="default card" @tap="form.isDefault = !form.isDefault">
        <text class="default__label">设为默认地址</text>
        <view class="switch" :class="{ on: form.isDefault }"><view class="switch__dot"></view></view>
      </view>

      <view style="height: 200rpx"></view>
    </scroll-view>

    <view class="footbar">
      <view class="footbar__btn" @tap="save">保存地址</view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

const user = useUserStore()
const isEdit = ref(false)
const editId = ref('')
const tagOpts = ['家', '公司', '学校', '其他']

const form = reactive({
  name: '',
  phone: '',
  detail: '',
  tag: '家',
  isDefault: false,
  lat: 31.186,
  lng: 121.443
})

onLoad((opts) => {
  if (opts.id) {
    isEdit.value = true
    editId.value = opts.id
    const a = user.addresses.find((x) => x.id === opts.id)
    if (a) {
      form.name = a.name
      form.phone = (a.phone || '').replace(/\*/g, '')
      form.detail = a.detail
      form.tag = a.tag || '家'
      form.isDefault = !!a.isDefault
      form.lat = a.lat
      form.lng = a.lng
    }
  }
})

function pickOnMap() {
  uni.chooseLocation
    ? uni.chooseLocation({
        success: (r) => {
          form.detail = r.address + (r.name || '')
          form.lat = r.latitude
          form.lng = r.longitude
        },
        fail: () => {
          uni.showToast({ title: '演示环境：已填入示例位置', icon: 'none' })
          form.detail = '上海市徐汇区虹桥路 3 号'
        }
      })
    : uni.showToast({ title: '演示环境：地图选点', icon: 'none' })
}
function save() {
  if (!form.name.trim()) return uni.showToast({ title: '请填写联系人', icon: 'none' })
  if (!/^1\d{10}$/.test(form.phone)) return uni.showToast({ title: '手机号格式不正确', icon: 'none' })
  if (!form.detail.trim()) return uni.showToast({ title: '请填写收货地址', icon: 'none' })

  const payload = {
    name: form.name.trim(),
    phone: form.phone,
    detail: form.detail.trim(),
    tag: form.tag,
    isDefault: form.isDefault,
    lat: form.lat,
    lng: form.lng
  }
  if (isEdit.value) {
    if (form.isDefault) user.setDefaultAddress(editId.value)
    user.updateAddress(editId.value, payload)
  } else {
    user.addAddress({ id: 'a' + Date.now(), ...payload })
  }
  uni.showToast({ title: '已保存', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 600)
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
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
}
.nav__title {
  font-size: 34rpx;
  font-weight: 600;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 32rpx;
}
.card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 8rpx 32rpx;
  box-shadow: var(--shadow-card);
  margin-bottom: 24rpx;
}
.field {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 2rpx solid var(--color-border-light);
}
.field:last-child {
  border-bottom: none;
}
.field--col {
  align-items: flex-start;
}
.field__label {
  width: 160rpx;
  font-size: 28rpx;
  color: var(--color-text-primary);
  flex-shrink: 0;
}
.field__input {
  flex: 1;
  font-size: 28rpx;
}
.field__map {
  flex: 1;
  font-size: 28rpx;
  color: var(--color-primary);
  text-align: right;
}
.field__area {
  width: 100%;
  height: 120rpx;
  font-size: 28rpx;
}
.tags {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
}
.tags__label {
  width: 160rpx;
  font-size: 28rpx;
}
.tags__opts {
  flex: 1;
  display: flex;
  gap: 20rpx;
}
.tag-opt {
  padding: 10rpx 28rpx;
  border: 2rpx solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: 26rpx;
  color: var(--color-text-secondary);
}
.tag-opt.on {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.default {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
}
.default__label {
  font-size: 28rpx;
}
.switch {
  width: 88rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: var(--color-border);
  position: relative;
  transition: background 0.2s;
}
.switch.on {
  background: var(--color-primary);
}
.switch__dot {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}
.switch.on .switch__dot {
  transform: translateX(40rpx);
}
.footbar {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: calc(32rpx + env(safe-area-inset-bottom));
  z-index: 20;
}
.footbar__btn {
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  background: var(--gradient-primary-btn);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-primary-glow);
}
</style>
