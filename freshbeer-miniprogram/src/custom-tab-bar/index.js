Component({
  data: {
    selected: 0,
    list: [
      { pagePath: 'pages/index/index', text: '首页', icon: '/static/tabbar/home.svg', activeIcon: '/static/tabbar/home-active.svg' },
      { pagePath: 'pages/category/category', text: '分类', icon: '/static/tabbar/category.svg', activeIcon: '/static/tabbar/category-active.svg' },
      { pagePath: 'pages/cart/cart', text: '购物车', icon: '/static/tabbar/cart.svg', activeIcon: '/static/tabbar/cart-active.svg' },
      { pagePath: 'pages/order/order', text: '订单', icon: '/static/tabbar/order.svg', activeIcon: '/static/tabbar/order-active.svg' },
      { pagePath: 'pages/profile/profile', text: '我的', icon: '/static/tabbar/profile.svg', activeIcon: '/static/tabbar/profile-active.svg' }
    ]
  },
  lifetimes: {
    attached() {
      this.updateSelected()
    }
  },
  pageLifetimes: {
    show() {
      this.updateSelected()
    }
  },
  methods: {
    updateSelected() {
      const pages = getCurrentPages()
      const route = pages.length ? pages[pages.length - 1].route : ''
      const selected = this.data.list.findIndex((item) => item.pagePath === route)
      this.setData({ selected: selected >= 0 ? selected : 0 })
    },
    switchTab(event) {
      wx.switchTab({ url: '/' + event.currentTarget.dataset.path })
    }
  }
})
