# 管理员商品管理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为指定手机号的服务端管理员提供安全的商品增删改和上下架能力。

**Architecture:** 登录云函数返回服务端计算的角色，客户端只展示入口；所有商品写操作由独立云函数再次根据 `openid` 校验管理员角色。Mock 路由复用同名操作以支持无云环境演示。

**Tech Stack:** uni-app Vue 3、Pinia、uniCloud 腾讯云、Node test。

**Spec:** `docs/superpowers/specs/2026-09-15-admin-product-management-design.md`

## Global Constraints

- 管理员身份只能由云端 `users.role` 授予。
- 管理员手机号从云函数环境变量 `ADMIN_PHONE` 读取。
- 删除商品必须软删除为 `onSale: false`。
- 所有修改先写失败测试，再写实现，并执行微信构建。

---

### Task 1: 管理员身份与登录资料

**Files:** `cloudfunctions/login/index.js`、`src/store/user.js`、`src/utils/auth.js`、`tests/admin-auth.test.mjs`

**Interfaces:** 产生 `user.role` 和 `user.phone`；`user.isAdmin` 供页面使用。

- [ ] 写测试，断言管理员角色仅由服务端资料决定，普通用户不可伪造。
- [ ] 运行 `node --experimental-default-type=module --test tests/admin-auth.test.mjs`，确认失败。
- [ ] 在登录云函数中使用 `ADMIN_PHONE` 比较已解密手机号，返回 `role`；用户 store 持久化角色并提供 `isAdmin` getter。
- [ ] 再次运行测试，确认通过。

### Task 2: 商品管理云函数和 Mock 接口

**Files:** 新建 `cloudfunctions/listAdminProducts/index.js`、`createProduct/index.js`、`updateProduct/index.js`、`deleteProduct/index.js`；修改 `src/utils/mock.js`、新建 `src/services/admin.js`、`tests/admin-products.test.mjs`

**Interfaces:** `listAdminProducts({openid})`、`createProduct({openid, product})`、`updateProduct({openid,id,patch})`、`deleteProduct({openid,id})`。

- [ ] 写测试，验证管理员可变更商品、普通用户获得 403、删除会下架而非移除。
- [ ] 运行 `node --experimental-default-type=module --test tests/admin-products.test.mjs`，确认失败。
- [ ] 实现统一 `assertAdmin`、商品字段校验与软删除；实现等名 Mock 路由和前端服务。
- [ ] 再次运行测试，确认通过。

### Task 3: 管理入口与商品管理页面

**Files:** 修改 `src/pages/profile/profile.vue`、`src/pages.json`；新建 `src/pages/admin-products/admin-products.vue`、`src/pages/admin-product-edit/admin-product-edit.vue`、`tests/admin-page-shell.test.mjs`

**Interfaces:** 管理页只在 `user.isAdmin` 时可见，且页面加载时二次检查权限。

- [ ] 写测试，验证两条路由、管理员入口和权限拦截存在。
- [ ] 运行 `node --experimental-default-type=module --test tests/admin-page-shell.test.mjs`，确认失败。
- [ ] 实现列表、新增编辑表单、上下架、软删除确认和刷新；使用共享安全区导航。
- [ ] 再次运行测试，确认通过。

### Task 4: 微信端验收

**Files:** `tests/*.test.mjs`、`PROJECT_HANDOFF.md`

- [ ] 运行所有测试：`node --experimental-default-type=module --test tests/*.test.mjs`。
- [ ] 构建：`npm run build:mp-weixin`。
- [ ] 在微信开发者工具以管理员和普通用户分别验证入口、权限拒绝、商品新增编辑上下架删除。
- [ ] 更新接管手册，记录 `ADMIN_PHONE`、手机号授权和云函数部署要求。
