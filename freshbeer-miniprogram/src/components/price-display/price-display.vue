<template>
  <text class="price num"><text class="sym">¥</text>{{ formatPrice(price) }}</text>
</template>

<script setup>
import { formatPrice } from '@/utils/format'
defineProps({
  price: { type: [Number, String], default: 0 }
})
</script>

<style scoped>
.price {
  font-family: var(--font-number);
  color: var(--color-primary);
  font-weight: 700;
  font-size: var(--text-price-m);
  line-height: 1;
}
.sym {
  font-size: 0.72em;
  margin-right: 2rpx;
}
</style>
