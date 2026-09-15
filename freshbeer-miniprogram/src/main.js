import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useCartStore } from './store/cart'
import { useUserStore } from './store/user'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  useCartStore(pinia).hydrate()
  useUserStore(pinia).hydrate()
  // 自定义导航页必须自行避开状态栏；统一暴露真实状态栏高度给页面模板使用。
  const systemInfo = uni.getSystemInfoSync()
  app.config.globalProperties.$statusBarHeight = systemInfo.statusBarHeight || 0
  return {
    app
  }
}
