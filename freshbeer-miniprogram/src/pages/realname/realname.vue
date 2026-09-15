<template>
  <view class="page">
    <fb-page-nav title="实名认证" />

    <scroll-view scroll-y class="content">
      <view class="warn">
        <text class="warn__title">⚠ 合规提示</text>
        <text class="warn__text"
          >根据《未成年人保护法》第 59 条及 2025 年酒类销售新规，购买酒精饮品须为成年人（≥18
          周岁）。我们将对身份信息进行核验，信息仅用于年龄验证，严格保密。</text
        >
      </view>

      <!-- 步骤指示器 -->
      <view class="steps">
        <view class="stepi" v-for="(s, i) in stepLabels" :key="i">
          <view class="stepi__dot" :class="{ done: curStep > i, doing: curStep === i }">
            <text v-if="curStep > i">✓</text>
            <text v-else class="num">{{ i + 1 }}</text>
          </view>
          <text class="stepi__label" :class="{ on: curStep >= i }">{{ s }}</text>
          <view v-if="i < stepLabels.length - 1" class="stepi__line" :class="{ done: curStep > i }"></view>
        </view>
      </view>

      <view class="form card">
        <view class="field">
          <text class="field__label">真实姓名</text>
          <input class="field__input" v-model="name" placeholder="请输入与证件一致的姓名" />
        </view>
        <view class="field">
          <text class="field__label">身份证号</text>
          <input
            class="field__input"
            v-model="idno"
            placeholder="18 位居民身份证号"
            maxlength="18"
          />
        </view>
      </view>

      <!-- 身份证上传 -->
      <view class="idcard card">
        <view class="idcard__title">上传身份证</view>
        <view class="idcard__row">
          <view class="idcard__box" :class="{ done: idFront }" @tap="upload('front')">
            <fb-icon class="idcard__ico" name="card" :size="26" />
            <text class="idcard__label">{{ idFront ? '人像面已上传' : '人像面' }}</text>
          </view>
          <view class="idcard__box" :class="{ done: idBack }" @tap="upload('back')">
            <fb-icon class="idcard__ico" name="card" :size="26" />
            <text class="idcard__label">{{ idBack ? '国徽面已上传' : '国徽面' }}</text>
          </view>
        </view>
      </view>

      <view class="face card" @tap="face">
        <view class="face__icon"><fb-icon :name="faced ? 'shield' : 'user'" :size="34" /></view>
        <view class="face__body">
          <text class="face__title">{{ faced ? '人脸识别已完成' : '人脸识别（活体检测）' }}</text>
          <text class="face__desc">{{
            faced ? '已通过活体核验' : '点击开始人脸识别，确认本人操作'
          }}</text>
        </view>
      </view>

      <view class="tip">未成年人禁止购买酒精饮品 · 适量饮酒，禁止酒驾</view>
      <view style="height: 180rpx"></view>
    </scroll-view>

    <view class="footbar">
      <view class="footbar__btn" :class="{ disabled: !canSubmit }" @tap="submit">提交认证</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'

const user = useUserStore()
const name = ref('')
const idno = ref('')
const faced = ref(false)
const idFront = ref(false)
const idBack = ref(false)

const stepLabels = ['填写信息', '上传证件', '人脸识别', '完成']
const infoDone = computed(() => name.value.trim() && idno.value.length === 18)
const idDone = computed(() => idFront.value && idBack.value)
const curStep = computed(() => {
  if (faced.value) return 3
  if (idDone.value) return 2
  if (infoDone.value) return 1
  return 0
})
const canSubmit = computed(() => infoDone.value && idDone.value && faced.value)

function upload(side) {
  uni.showLoading({ title: '上传中' })
  setTimeout(() => {
    uni.hideLoading()
    if (side === 'front') idFront.value = true
    else idBack.value = true
    uni.showToast({ title: '上传成功', icon: 'success' })
  }, 700)
}
function face() {
  if (faced.value) return
  if (!idDone.value) {
    uni.showToast({ title: '请先上传身份证', icon: 'none' })
    return
  }
  uni.showLoading({ title: '识别中' })
  setTimeout(() => {
    uni.hideLoading()
    faced.value = true
    uni.showToast({ title: '活体检测通过', icon: 'success' })
  }, 1000)
}

function getAge(id) {
  const y = +id.substr(6, 4)
  const m = +id.substr(10, 2)
  const d = +id.substr(12, 2)
  if (!y) return 0
  const now = new Date()
  let age = now.getFullYear() - y
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--
  return age
}

function submit() {
  if (!canSubmit.value) {
    uni.showToast({ title: '请完整填写信息并完成人脸', icon: 'none' })
    return
  }
  const age = getAge(idno.value)
  if (age < 18) {
    uni.showModal({
      title: '认证失败',
      content: '检测到未满 18 周岁，依法不可购买酒精饮品。',
      showCancel: false
    })
    return
  }
  user.setRealname({ name: name.value, idnoMasked: idno.value.replace(/(\d{6})\d{8}(\w)/, '$1********$2') })
  uni.showToast({ title: '认证成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 800)
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
.warn {
  background: var(--color-warning-light);
  border-radius: var(--radius-input);
  padding: 28rpx;
  margin-bottom: 24rpx;
}
.warn__title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--color-warning);
}
.warn__text {
  display: block;
  font-size: 26rpx;
  color: #6b4a00;
  line-height: 1.6;
  margin-top: 12rpx;
}
.card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 8rpx 32rpx;
  box-shadow: var(--shadow-card);
  margin-bottom: 24rpx;
}
.steps {
  display: flex;
  align-items: flex-start;
  padding: 12rpx 8rpx 28rpx;
}
.stepi {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.stepi__dot {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: var(--color-border);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  z-index: 2;
}
.stepi__dot.doing {
  background: var(--color-primary);
}
.stepi__dot.done {
  background: var(--color-success);
}
.stepi__label {
  font-size: 22rpx;
  color: var(--color-text-tertiary);
  margin-top: 12rpx;
}
.stepi__label.on {
  color: var(--color-text-primary);
  font-weight: 600;
}
.stepi__line {
  position: absolute;
  top: 26rpx;
  left: 50%;
  right: -50%;
  height: 4rpx;
  background: var(--color-border);
  z-index: 1;
}
.stepi__line.done {
  background: var(--color-success);
}
.idcard {
  padding: 32rpx;
}
.idcard__title {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}
.idcard__row {
  display: flex;
  gap: 24rpx;
}
.idcard__box {
  flex: 1;
  height: 192rpx;
  border: 2rpx dashed var(--color-border);
  border-radius: var(--radius-input);
  background: var(--color-surface-alt);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}
.idcard__box.done {
  border-style: solid;
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.idcard__ico {
  font-size: 60rpx;
  color: var(--color-text-tertiary);
}
.idcard__box.done .idcard__ico {
  color: var(--color-primary);
}
.idcard__label {
  font-size: 24rpx;
  color: var(--color-text-secondary);
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
.field__label {
  width: 160rpx;
  font-size: 28rpx;
  color: var(--color-text-primary);
}
.field__input {
  flex: 1;
  font-size: 28rpx;
}
.face {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.face__icon {
  font-size: 64rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}
.face__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.face__title {
  font-size: 30rpx;
  font-weight: 600;
}
.face__desc {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  margin-top: 4rpx;
}
.tip {
  text-align: center;
  font-size: 22rpx;
  color: var(--color-text-tertiary);
  padding: 24rpx 0;
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
.footbar__btn.disabled {
  opacity: 0.5;
}
</style>
