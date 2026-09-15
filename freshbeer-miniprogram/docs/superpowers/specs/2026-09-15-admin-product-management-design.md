# 管理员商品管理设计

## 目标

仅在完成微信手机号授权且手机号为 `15024568821` 的用户登录后，显示“商品管理”入口，并允许其新增、编辑、上下架及删除商品。

## 权限模型

`users` 集合保存 `phone` 与 `role`。`login` 云函数从受信任的手机号结果中写入角色；角色判断只在云端执行。管理员手机号由云函数环境变量 `ADMIN_PHONE` 配置，默认值不可作为生产配置。客户端仅依据服务端返回的 `role` 显示入口。

客户端调用管理云函数时传递 `openid`；每个云函数先查询 `users` 并要求 `role === 'admin'`。删除为软删除：更新 `onSale: false`、`deletedAt`，避免破坏历史订单。

## 用户流程

1. 我的页登录后，管理员看到“商品管理”。
2. 商品管理页读取管理员商品列表，支持新增、编辑、上下架和删除。
3. 表单至少校验名称、分类、价格、库存；折扣价不可高于原价。
4. 所有突变成功后刷新列表；未登录或无权限提示且不进入管理页。

## 文件边界

- `cloudfunctions/*Product/index.js`：服务端鉴权及商品 CRUD。
- `src/services/admin.js`：管理接口适配。
- `src/pages/admin-products/admin-products.vue`：商品列表及操作。
- `src/pages/admin-product-edit/admin-product-edit.vue`：新建/编辑表单。
- `src/store/user.js`：保存服务端返回的角色与手机号。
- `src/pages/profile/profile.vue`：仅向管理员显示入口。

## 约束与验收

- 不在前端硬编码或判定管理员手机号。
- Mock 与云函数具有同名接口，便于本地演示。
- 管理操作必须有回归测试；微信端构建必须成功。
- 真正手机号登录需要 `getPhoneNumber` 授权与服务端手机号解密实现，且微信后台需已开通该能力。
