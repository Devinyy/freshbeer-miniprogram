<template>
  <scroll-view scroll-y class="nav" :show-scrollbar="false">
    <view
      v-for="c in categories"
      :key="c.id"
      class="nav__item"
      :class="{
        'nav__item--active': c.id === activeId,
        'nav__item--comp': c.id === 'comp'
      }"
      @tap="$emit('change', c.id)"
    >
      <fb-icon class="nav__icon" :name="c.icon" :size="18" :color="c.id === activeId ? '#C87921' : '#5F5042'" />
      <text class="nav__text">{{ c.name }}</text>
    </view>
  </scroll-view>
</template>

<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  activeId: { type: String, default: '' }
})
defineEmits(['change'])
</script>

<style scoped>
.nav {
  width: 176rpx;
  height: 100%;
  background: var(--color-surface-alt);
  flex-shrink: 0;
}
.nav__item {
  min-height: 96rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  font-size: 26rpx;
  color: var(--color-text-primary);
  position: relative;
  padding: 8rpx 0;
}
.nav__item--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 700;
}
.nav__item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 16rpx;
  bottom: 16rpx;
  width: 6rpx;
  background: var(--color-primary);
  border-radius: 0 4rpx 4rpx 0;
}
.nav__item--comp {
  color: var(--color-danger);
}
.nav__item--comp.nav__item--active {
  color: var(--color-danger);
}
.nav__icon {
  display: block;
}
.nav__text {
  font-size: 24rpx;
}
</style>
