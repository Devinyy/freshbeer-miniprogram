/** 同步原生 custom-tab-bar 的选中态；切换 Tab 时由各主页 onShow 调用。 */
export function syncCustomTabBar(pagePath) {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  const tabBar = page && typeof page.getTabBar === 'function' ? page.getTabBar() : null
  if (!tabBar) return
  // 页面实例拿到的原生组件不保证暴露其 data，不能读取 tabBar.data.list。
  const paths = ['pages/index/index', 'pages/category/category', 'pages/cart/cart', 'pages/order/order', 'pages/profile/profile']
  const selected = paths.indexOf(pagePath)
  if (selected >= 0) tabBar.setData({ selected })
}
