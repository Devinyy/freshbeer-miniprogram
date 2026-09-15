<template>
  <view class="fb-icon" :style="style"></view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: '#2C1810' }
})

// 24x24 线性图标（1.8 描边），跨端以 data-URI 背景图渲染
const paths = {
  home: (c) =>
    `<path d="M3 11.5 12 4l9 7.5" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 10v9.5h13V10" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  category: (c) =>
    `<rect x="3.5" y="3.5" width="7" height="7" rx="1.6" fill="none" stroke="${c}" stroke-width="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" fill="none" stroke="${c}" stroke-width="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" fill="none" stroke="${c}" stroke-width="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" fill="none" stroke="${c}" stroke-width="1.8"/>`,
  cart: (c) =>
    `<path d="M3 4h2.2l2 11h10l2-8H6.5" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.4" fill="${c}"/><circle cx="17" cy="19" r="1.4" fill="${c}"/>`,
  order: (c) =>
    `<rect x="5" y="3.5" width="14" height="17" rx="2" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  user: (c) =>
    `<circle cx="12" cy="8" r="3.6" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  search: (c) =>
    `<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M15.5 15.5 21 21" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  location: (c) =>
    `<path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15 12 21 12 21Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="${c}" stroke-width="1.8"/>`,
  back: (c) =>
    `<path d="M15 4 7 12l8 8" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  close: (c) => `<path d="m6 6 12 12M18 6 6 18" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  plus: (c) => `<path d="M12 5v14M5 12h14" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  heart: (c) => `<path d="M20 8.8C20 15 12 20 12 20S4 15 4 8.8C4 5.8 7.8 4.2 10 6.8 12.2 4.2 20 5.8 20 8.8Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`,
  package: (c) => `<path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><path d="m4 7 8 4 8-4M12 11v10" fill="none" stroke="${c}" stroke-width="1.8"/>`,
  ticket: (c) => `<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7Z" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M12 8v8" stroke="${c}" stroke-width="1.8" stroke-dasharray="2 2"/>`,
  truck: (c) => `<path d="M3 6h11v10H3zM14 10h3l3 3v3h-6z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="1.5" fill="${c}"/><circle cx="17" cy="18" r="1.5" fill="${c}"/>`,
  phone: (c) => `<path d="M7 3h3l1.4 4-2.2 1.8a14 14 0 0 0 6 6l1.8-2.2L21 14v3c0 1.1-.9 2-2 2C10.2 19 5 13.8 5 7c0-1.1.9-2 2-2Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`,
  settings: (c) => `<circle cx="12" cy="12" r="3" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M12 3v2M12 19v2M21 12h-2M5 12H3m15.4-6.4-1.4 1.4M7 17l-1.4 1.4m0-12.8L7 7m10 10 1.4 1.4" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  card: (c) => `<rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M3 10h18M6 15h4" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  shield: (c) => `<path d="M12 3 20 6v5c0 4.8-3.4 8.1-8 10-4.6-1.9-8-5.2-8-10V6l8-3Z" fill="none" stroke="${c}" stroke-width="1.8"/><path d="m8.5 12 2.2 2.2 4.8-5" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  target: (c) => `<circle cx="12" cy="12" r="8" fill="none" stroke="${c}" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  book: (c) => `<path d="M4 5.5A3.5 3.5 0 0 1 8 5h4v14H8a3.5 3.5 0 0 0-4 .5v-14Z M20 5.5A3.5 3.5 0 0 0 16 5h-4v14h4a3.5 3.5 0 0 1 4 .5v-14Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`,
  headset: (c) => `<path d="M4 13v-1a8 8 0 0 1 16 0v1" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M4 13h3v5H5a1 1 0 0 1-1-1v-4Zm16 0h-3v5h2a1 1 0 0 0 1-1v-4Z" fill="none" stroke="${c}" stroke-width="1.8"/>`,
  trash: (c) => `<path d="M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  map: (c) => `<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 3v16m6-14v16" stroke="${c}" stroke-width="1.8"/>`,
  camera: (c) => `<path d="M4 8h4l1.5-2h5L16 8h4v11H4V8Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3" fill="none" stroke="${c}" stroke-width="1.8"/>`,
  warning: (c) => `<path d="M12 3 22 20H2L12 3Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9v4m0 3h.01" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  beer: (c) => `<path d="M7 5h9v14H7zM16 8h2a2 2 0 0 1 0 4h-2" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 8h9" stroke="${c}" stroke-width="1.8"/>`,
  star: (c) => `<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`
}

const dataUri = computed(() => {
  const fn = paths[props.name] || paths.home
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${fn(props.color)}</svg>`
  return 'data:image/svg+xml,' + encodeURIComponent(svg)
})
const style = computed(() => {
  const s = typeof props.size === 'number' ? props.size + 'px' : props.size
  return `width:${s};height:${s};background-image:url("${dataUri.value}");background-size:contain;background-repeat:no-repeat;background-position:center;`
})
</script>

<style scoped>
.fb-icon {
  display: inline-block;
}
</style>
