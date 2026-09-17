<script>
export default {
  globalData: {
    // 微信云开发 / uniCloud 环境占位（替换为你自己的环境 ID）
    uniCloudEnv: '', // 例如 'freshbeer-dev-xxxx'
    // 微信支付商户号占位（在云函数 payOrder 中使用）
    mchId: ''
  },
  onLaunch() {
    // 初始化云环境（占位，需填入真实 env）
    // #ifdef MP-WEIXIN
    if (this.globalData.uniCloudEnv) {
      uni.cloud.init({ env: this.globalData.uniCloudEnv })
    }
    // #endif
    console.log('鲜啤到 · 启动')
  },
  onShow() {},
  onHide() {}
}
</script>

<style lang="scss">
/* 全局设计令牌（CSS 变量，运行时组件直接引用） */
:root {
  /* 主色 */
  --color-primary: #f5a623;
  --color-primary-hover: #e8951a;
  --color-primary-active: #d4861a;
  --color-primary-light: #fff0d6;
  --color-primary-disabled: #f5d49e;

  /* 辅色 */
  --color-secondary-dark: #2c1810;
  --color-secondary-cream: #fff8f0;
  --color-secondary-brown: #6b4423;

  /* 中性色 */
  --color-bg: #fff8f0;
  --color-surface: #ffffff;
  --color-surface-alt: #faf3eb;
  --color-border: #e8ddd0;
  --color-border-light: #f0e8dc;
  --color-text-primary: #2c1810;
  --color-text-secondary: #8b7d6b;
  --color-text-tertiary: #b0a490;
  --color-text-inverse: #ffffff;
  --color-overlay: rgba(44, 24, 16, 0.5);

  /* 语义色 */
  --color-success: #4caf50;
  --color-success-light: #e8f5e9;
  --color-warning: #ff9800;
  --color-warning-light: #fff3e0;
  --color-danger: #f44336;
  --color-danger-light: #ffebee;
  --color-info: #2196f3;
  --color-info-light: #e3f2fd;

  /* 品牌专属色 */
  --color-storage-exclusive: #f5a623;
  --color-storage-exclusive-bg: #fff0d6;
  --color-flash-sale: #ff3b30;
  --color-flash-sale-bg: #ffe5e3;
  --color-cold-chain: #00bfa5;
  --color-cold-chain-bg: #e0f7f4;
  --color-member-gold: #d4a843;

  /* 渐变 */
  --gradient-primary-btn: linear-gradient(135deg, #f5a623 0%, #e8951a 100%);
  --gradient-banner: linear-gradient(135deg, #f5a623 0%, #ff7842 100%);
  --gradient-beer-glass: linear-gradient(180deg, #fff8f0 0%, #e8a317 30%, #3d2817 100%);
  --gradient-flash-sale: linear-gradient(135deg, #ff3b30 0%, #ff6b35 100%);

  /* 字体 */
  --font-heading: 'PingFang SC', 'HarmonyOS Sans SC', 'Source Han Sans CN', sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'HarmonyOS Sans SC', sans-serif;
  --font-number: 'DIN Alternate', 'DIN', 'Roboto Mono', 'SF Mono', 'Menlo', monospace;

  /* 字号 */
  --text-display: 64rpx;
  --text-h1: 48rpx;
  --text-h2: 40rpx;
  --text-h3: 36rpx;
  --text-body-l: 32rpx;
  --text-body: 28rpx;
  --text-caption: 24rpx;
  --text-micro: 20rpx;
  --text-price-l: 40rpx;
  --text-price-m: 32rpx;
  --text-price-s: 28rpx;

  /* 间距 */
  --space-xxs: 8rpx;
  --space-xs: 16rpx;
  --space-sm: 24rpx;
  --space-md: 32rpx;
  --space-lg: 40rpx;
  --space-xl: 48rpx;
  --space-page-margin: 32rpx;
  --space-card-padding: 24rpx;

  /* 圆角 */
  --radius-tag: 8rpx;
  --radius-input: 16rpx;
  --radius-image: 16rpx;
  --radius-button: 16rpx;
  --radius-card: 24rpx;
  --radius-sheet: 32rpx;
  --radius-pill: 48rpx;
  --radius-circle: 1998rpx;

  /* 阴影（暖色系） */
  --shadow-card: 0 2rpx 8rpx rgba(44, 24, 16, 0.06);
  --shadow-raised: 0 4rpx 16rpx rgba(44, 24, 16, 0.08);
  --shadow-floating: 0 8rpx 32rpx rgba(44, 24, 16, 0.12);
  --shadow-overlay: 0 16rpx 64rpx rgba(44, 24, 16, 0.16);
  --shadow-primary-glow: 0 4rpx 16rpx rgba(245, 166, 35, 0.3);

  /* Z-index */
  --z-tabbar: 300;
  --z-cart-bar: 350;
  --z-modal: 400;
  --z-toast: 500;
  --z-overlay: 600;
}

page {
  /* 微信小程序 WXSS 不保证继承 :root；令牌必须挂在 page 才能被所有页面组件读取。 */
  --color-primary: #f5a623;
  --color-primary-light: #fff0d6;
  --color-secondary-dark: #2c1810;
  --color-secondary-cream: #fff8f0;
  --color-secondary-brown: #6b4423;
  --color-bg: #fff8f0;
  --color-surface: #ffffff;
  --color-surface-alt: #faf3eb;
  --color-border: #e8ddd0;
  --color-border-light: #f0e8dc;
  --color-text-primary: #2c1810;
  --color-text-secondary: #8b7d6b;
  --color-text-tertiary: #b0a490;
  --color-success: #4caf50;
  --color-success-light: #e8f5e9;
  --color-warning: #ff9800;
  --color-warning-light: #fff3e0;
  --color-danger: #f44336;
  --color-danger-light: #ffebee;
  --color-info: #2196f3;
  --color-cold-chain: #00bfa5;
  --color-cold-chain-bg: #e0f7f4;
  --color-flash-sale: #ff3b30;
  --color-flash-sale-bg: #ffe5e3;
  --color-storage-exclusive: #f5a623;
  --color-storage-exclusive-bg: #fff0d6;
  --color-member-gold: #d4a843;
  --gradient-primary-btn: linear-gradient(135deg, #f5a623 0%, #e8951a 100%);
  --gradient-beer-glass: linear-gradient(180deg, #fff8f0 0%, #e8a317 30%, #3d2817 100%);
  --shadow-card: 0 2rpx 8rpx rgba(44, 24, 16, .06);
  --shadow-primary-glow: 0 4rpx 16rpx rgba(245, 166, 35, .3);
  --radius-tag: 8rpx;
  --radius-image: 16rpx;
  --radius-button: 16rpx;
  --radius-card: 24rpx;
  --radius-sheet: 32rpx;
  --radius-pill: 48rpx;
  --space-sm: 24rpx;
  --space-md: 32rpx;
  --space-card-padding: 24rpx;
  --text-caption: 24rpx;
  --text-micro: 20rpx;
  --text-price-m: 32rpx;
  background-color: var(--color-bg);
  font-family: var(--font-body);
  color: var(--color-text-primary);
  font-size: var(--text-body);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

html,
body,
#app {
  overflow-x: hidden;
}

view,
text,
button,
input,
textarea,
image,
scroll-view {
  box-sizing: border-box;
}

/* 页面主内容区常用 flex + padding；将 padding 纳入高度，避免在小程序 scroll-view 内溢出。 */
.content {
  box-sizing: border-box;
}

/* 等宽数字通用类 */
.num {
  font-family: var(--font-number);
  font-feature-settings: 'tnum';
}

/* 文本省略 */
.ellipsis-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ellipsis-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* 合规警示语固定底 */
.compliance-warning {
  text-align: center;
  font-size: var(--text-micro);
  color: var(--color-text-tertiary);
  padding: var(--space-xs) var(--space-md);
  line-height: 1.6;
  padding-bottom: calc(var(--space-xs) + env(safe-area-inset-bottom));
}
</style>
