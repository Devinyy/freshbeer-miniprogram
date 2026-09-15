# 鲜啤到项目接管手册

> 最后更新：2026-09-15。本文面向后续 Codex/开发会话，用于快速理解、运行和安全地继续维护本项目。

## 1. 项目定位与工作目录

“鲜啤到”是精酿鲜啤即时配送小程序 Demo。它包含从选购、购物车、实名校验、下单支付，到订单、退款及配送追踪的演示闭环。

- 仓库/交付根目录：当前目录
- 可运行应用：`freshbeer-miniprogram/`
- 原型参考：`prototype/`（17 个独立 HTML 页面及预览入口）
- 交付背景和视觉规范：`交付说明.md`
- 当前目录与 `freshbeer-miniprogram/` 均**不是 Git 仓库**；改动前后请用文件级检查确认范围，勿假设可用 Git 回滚。

## 2. 技术栈与入口

| 范畴 | 实现 |
| --- | --- |
| 前端 | uni-app 3 + Vue 3（`<script setup>`）+ Vite |
| 状态 | Pinia |
| 样式 | SCSS、全局 CSS 设计令牌 |
| 后端骨架 | uniCloud 腾讯云云函数 |
| 默认数据源 | 本地 Mock，无需云环境 |
| 目标端 | 微信小程序；也可构建 H5 / App |

核心入口与配置：

- `freshbeer-miniprogram/src/main.js`：创建 Vue 应用并挂载 Pinia。
- `freshbeer-miniprogram/src/App.vue`：全局样式、设计令牌与可选 uniCloud 环境初始化。
- `freshbeer-miniprogram/src/pages.json`：18 个页面路由及自定义 5 Tab 栏。
- `freshbeer-miniprogram/src/manifest.json`：小程序配置。当前微信 AppID 为 `wxd1343ad33c6d5792`。
- `freshbeer-miniprogram/package.json`：全部启动、构建、回归测试脚本。

## 3. 页面、组件与业务流

底部 Tab 为：首页、分类、购物车、订单、我的。其余页面包括启动、定位、商品详情、搜索、确认订单、收银台、支付结果、订单详情、配送追踪、地址编辑、实名认证和退款。

典型交易流：

`首页/分类/搜索 → 商品详情或 SKU 弹层 → 购物车 → 确认订单 → 实名校验 → 创建订单 → 支付 → 支付结果/订单详情 → 配送追踪/退款`

主要目录：

| 目录 | 职责 |
| --- | --- |
| `src/pages/` | 各业务页面；`order-confirm`、`payment`、`order-detail` 为下单主链路关键节点 |
| `src/components/` | 商品卡、SKU 弹层、价格展示、购物车栏、合规提示、分类导航和图标 |
| `src/store/cart.js` | 购物车、起送价（30 元）、优惠券与金额计算 |
| `src/store/user.js` | 登录、实名状态、余额、会员和地址 |
| `src/services/` | 页面调用的产品、支付、配送、退款服务层 |
| `src/utils/` | 请求封装、Mock 数据、登录和格式化工具 |
| `cloudfunctions/` | 真实 uniCloud 云函数骨架及数据库种子数据 |

## 4. 数据与运行模式

应用当前默认运行在 Mock 模式：`src/utils/request.js` 中 `USE_MOCK = true`。所有服务请求会在约 180ms 延迟后进入 `src/utils/mock.js` 的 `mockRouter()`。

Mock 覆盖的接口名为：`login`、`decryptPhone`、`getProducts`、`getProduct`、`getAddresses`、`createOrder`、`payOrder`、`refundOrder`、`getOrder`、`getOrderList`、`getRiderLocation`，以及管理员商品 CRUD 接口。

Mock 订单数据仅保存在当前 JS 运行时内存；重新启动/重新加载会重置。测试可调用 `resetMockState()` 获得干净状态。

切换真实云端时需要：

1. 将 `USE_MOCK` 设为 `false`；
2. 在 `App.vue` 配置有效的 `uniCloudEnv`；
3. 部署 `cloudfunctions/` 下云函数，导入 `cloudfunctions/database/db_init.json`；
4. 为云函数配置 `WX_APPID`、`WX_SECRET`、`WX_MCH_ID`、`WX_PAY_API_KEY`、`WX_PAY_NOTIFY`、`ADMIN_PHONE`。

### 管理员商品管理

- “我的”页在用户完成微信手机号授权后，根据服务端返回的 `role === 'admin'` 展示“商品管理”入口。
- 管理员手机号只在云函数环境变量 `ADMIN_PHONE` 配置；`decryptPhone` 通过微信一次性手机号 code 换取号码后写入 `users.role`。
- 管理页支持新增、编辑、上/下架和软删除；云函数 `listAdminProducts`、`createProduct`、`updateProduct`、`setProductOnSale`、`deleteProduct` 均再次查询 `users.role`，不可只依赖前端入口。
- Mock 模式将手机号授权模拟为管理员，便于开发验证；真实环境必须部署上述云函数后再将 `USE_MOCK` 切为 `false`。

## 5. 本地运行与验证

在应用目录执行：

```bash
cd freshbeer-miniprogram
npm install
npm run dev:mp-weixin
# 或 npm run dev:h5
npm run test:order
```

- 小程序开发产物由 uni-app 写入 `dist/dev/mp-weixin/`，使用微信开发者工具导入该目录。
- `dist/` 为构建产物，通常不要手工修改；应修改 `src/` 后重新构建。
- 已验证：`npm run test:order` 通过 2 项测试，覆盖余额支付后订单进入备货状态，以及退款申请不可重复提交。

## 6. 已知边界与继续开发注意点

- 云函数支付实现是演示骨架。真实上线必须完善微信支付异步回调、订单最终状态确认、退款 API、签名与密钥管理。
- `createOrder` 的库存校验与扣减没有事务/幂等保护；并发真实交易场景需要重构。
- Mock 方式下支付会直接视为成功，不能用来验证真实微信支付配置。
- 实名认证目前在前端状态层记录校验结果；生产场景应接入合法且合规的身份核验服务，并避免保存不必要的身份信息。
- 项目销售酒精饮品，首页、下单与组件中已有未成年人提示；业务改动时应保留并复核相应合规拦截。
- 视觉以 `prototype/` 和 `交付说明.md` 为参考；全局色彩、尺寸、间距等令牌在 `src/App.vue` 与 `src/uni.scss`。

## 7. 修改建议

1. 先确认是修改源码 `src/`、云函数 `cloudfunctions/`，还是仅调整原型 `prototype/`；三者不是自动同步关系。
2. 交易链路变更至少运行 `npm run test:order`；涉及 Mock 行为时同步更新 `src/utils/mock.js` 和测试。
3. 涉及支付、身份、地址、库存或退款时，优先评估真实云函数逻辑，不能仅修前端显示。
4. 完成修改后说明改动的源文件和验证命令；不要将 `dist/` 视为权威源码。
