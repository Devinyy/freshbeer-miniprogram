# 鲜啤到 · 精酿鲜啤外卖小程序

> uni-app (Vue3 + Vite) 跨端 + uniCloud(腾讯云) 后端 · 核心交易闭环 Demo

「鲜啤到」是一个面向精酿鲜啤外卖场景的小程序，包含 **双栏选购 → 购物车 → 确认订单 → 微信支付收银台 → 订单详情 → 实时配送追踪** 的完整交易闭环，并内置未成年人合规提示、冷链配送说明、储值专享价等业务特性。

## 特性一览

- 🍺 **双栏选购首页**：左侧分类导航 + 右侧商品流，复刻主流外卖 APP 体验
- 🛒 **规格弹层（SKU）**：3 级规格选择、步进器、加入购物车
- 💰 **储值专享价 / 秒杀价 / 冷链 / 热销 / 新品** 等多标签体系
- 📦 **购物车 → 确认订单 → 支付**：配送方式（立即送 / 预约 / 自提）、费用明细、微信支付与余额支付
- ↩️ **售后退款**：订单详情进入退款申请，支持原因、说明、退款处理中状态
- 🛡️ **未成年人合规**：下单前强制实名（基于身份证号校验 ≥18 岁）
- 🚚 **实时配送追踪**：地图 + 骑手位置轮询 + 冷链提示 + ETA
- 🧊 **冷链配送**与**打碎赔付**业务提示
- ⚡ **Mock 优先**：无需后端即可完整演示（见下方 `USE_MOCK` 开关）

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | uni-app 3.x（Vue 3 `<script setup>` 风格 + Vite） |
| 状态管理 | Pinia（cart / user 两个 store）|
| 样式 | SCSS + 全局 CSS 变量（设计令牌，见 `src/App.vue` 的 `:root`）|
| 后端 | uniCloud（腾讯云）：云函数 + 数据库集合 |
| 跨端 | 默认微信小程序，亦支持 H5 / App（`npm run dev:h5` 等）|

## 目录结构

```
freshbeer-miniprogram/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                 # 应用入口（createSSRApp + Pinia）
│   ├── App.vue                 # 全局设计令牌（:root CSS 变量）+ 合规样式
│   ├── manifest.json           # 小程序配置（appid / 定位权限 / uniCloud）
│   ├── pages.json              # 路由 + 自定义 tabBar + easycom 组件扫描
│   ├── uni.scss                # SCSS 变量（镜像设计令牌）
│   ├── custom-tab-bar/         # 自定义底部 5 Tab（含购物车角标）
│   ├── components/             # price-display / compliance-bar / category-nav
│   │                           # cart-bar / product-card / sku-popup
│   ├── pages/                  # index/product/category/cart/order-confirm/payment
│   │                           # /search/order-detail/delivery-tracking/profile
│   │                           # /address/realname/order/refund（共 18 页，SKU 为组件弹层）
│   ├── services/               # product / payment / delivery 业务服务
│   ├── store/                  # cart.js / user.js（Pinia）
│   └── utils/                  # format / auth / request / mock
└── cloudfunctions/             # 云函数（部署到 uniCloud 腾讯云）
    ├── login/                  # wx.login → openid → 用户 upsert → token
    ├── getProducts/            # 分类 + 商品列表
    ├── getProduct/             # 单个商品
    ├── getAddresses/           # 收货地址
    ├── createOrder/            # 库存校验 + 费用计算 + 写入订单 + 锁库存
    ├── payOrder/               # 微信支付 prepay（含完整签名骨架）
    ├── getOrder/               # 单个订单
    ├── getOrderList/           # 订单列表（按用户/状态）
    ├── getRiderLocation/       # 模拟骑手位置 + ETA，回写订单
    ├── refundOrder/            # 退款申请与退款处理中状态
    └── database/
        └── db_init.json        # 种子数据（8 分类 + 16 商品）
```

## 快速开始（Mock 模式，零后端）

Mock 模式开箱即跑，无需任何云服务配置：

```bash
# 1. 安装依赖（建议使用 Node 18+）
npm install

# 2. 运行微信小程序（会在 dist/dev/mp-weixin 产出，用微信开发者工具导入）
npm run dev:mp-weixin

# 3. 或者运行 H5（浏览器直接预览）
npm run dev:h5
```

> `src/utils/request.js` 顶部 `const USE_MOCK = true`，开启时所有 `callCloud` 走 `src/utils/mock.js` 的内置数据，无需 uniCloud 环境即可完整演示下单、支付、配送追踪和退款申请全流程。

### 运行订单流测试

```bash
npm run test:order
```

### 在微信开发者工具中预览

1. 用微信开发者工具「导入项目」，目录选择 `dist/dev/mp-weixin`
2. AppID 可用「测试号」（manifest 中已设为 `touristappid`），或填入你自己的 AppID
3. 编译即可看到「鲜啤到」小程序

## 切换到真实后端（uniCloud 腾讯云）

1. **配置云环境**：打开 `src/App.vue`，将 `globalData.uniCloudEnv` 改为你的环境 ID，例如：
   ```js
   globalData: { uniCloudEnv: 'freshbeer-dev-xxxx' }
   ```
2. **关闭 Mock**：将 `src/utils/request.js` 中 `const USE_MOCK = false`
3. **导入云函数**：将 `cloudfunctions/` 目录下各函数上传到 uniCloud（HBuilderX 右键「上传并运行」，或 CLI `uni-cloud`）
4. **初始化数据库**：将 `cloudfunctions/database/db_init.json` 导入 uniCloud 数据库，建立以下集合：
   - `categories`（分类）
   - `products`（商品，含 `stock` / `storagePrice` / `tags` / `flashSale` 等字段）
   - `orders`（订单）
   - `users`（用户）
   - `addresses`（地址）

### 云函数环境变量（建议放 uniCloud 环境配置，勿硬编码）

| 变量 | 说明 |
|---|---|
| `WX_APPID` | 小程序 AppID |
| `WX_SECRET` | 小程序 AppSecret（`login` 云函数使用）|
| `WX_MCH_ID` | 微信支付商户号（`payOrder` 使用）|
| `WX_PAY_API_KEY` | 商户 APIv2 密钥（`payOrder` 签名使用）|
| `WX_PAY_NOTIFY` | 支付结果异步回调地址（需公网可访问）|

> 未配置时云函数使用占位默认值（`YOUR_WX_APPID` 等），仅用于演示流程；真实交易需要配置商户参数并部署支付结果异步回调。

## 微信支付接入说明

`cloudfunctions/payOrder/index.js` 已实现 **API v2 签名、XML 统一下单和前端参数组装**：

- `buildSign()`：MD5 签名（按微信规则对非空参数排序后拼接 `&key=` 再 MD5）
- `payParams`：返回前端 `uni.requestPayment` 所需的 `timeStamp / nonceStr / package / signType / paySign`
- 真实部署需配置 `WX_*` 环境变量，并接入 `NOTIFY_URL` 异步回调完成最终订单状态确认

前端 `src/services/payment.js` 的 `payOrder()` 已通过 `#ifdef MP-WEIXIN` 条件编译处理：Mock 模式跳过真实支付，真实模式调用 `uni.requestPayment`；储值卡支付由云端校验余额并扣款。

## 业务合规要点

- 小程序首页、商品详情、合规底栏均展示 **「未成年人禁止购买酒精饮品 · 适量饮酒，禁止酒驾」**
- 提交订单前校验 `user.realnameVerified`；未实名跳转 `pages/realname` 完成实名（基于身份证号校验年龄 ≥18 岁）
- 冷链配送与打碎赔付作为业务提示内置于商品/订单流

## 构建产物

| 命令 | 产物 |
|---|---|
| `npm run dev:mp-weixin` / `build:mp-weixin` | `dist/dev/mp-weixin` 或 `dist/build/mp-weixin` |
| `npm run dev:h5` / `build:h5` | H5 站点 |
| `npm run dev:app` / `build:app` | App 打包资源 |

## 设计还原

视觉与交互严格对齐前期 HTML 原型（Starbucks 风格定制，品牌「鲜啤到」），设计令牌见 `src/App.vue` 的 `:root` 与 `src/uni.scss`，确保所有组件与设计稿像素级一致。

---

© 鲜啤到 Demo · Mock 模式可完整演示交易与退款状态；切换真实环境前需补齐微信支付统一下单、退款 API、异步回调和用户余额服务。
