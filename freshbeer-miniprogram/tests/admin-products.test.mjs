import test from 'node:test'
import assert from 'node:assert/strict'
import { mockRouter } from '../src/utils/mock.js'

const admin = { openid: 'mock-admin-openid', phone: '15024568821' }

test('only the configured phone receives the administrator role', () => {
  assert.equal(mockRouter('login', admin).user.role, 'admin')
  assert.equal(mockRouter('login', { openid: 'mock-user', phone: '13800000000' }).user.role, 'user')
})

test('administrator can create, edit, hide and soft-delete a product', () => {
  const created = mockRouter('createProduct', { ...admin, product: { name: '测试鲜啤', categoryId: 'fresh', price: 28, stock: 10 } }).product
  assert.equal(mockRouter('updateProduct', { ...admin, id: created.id, patch: { price: 30 } }).product.price, 30)
  assert.equal(mockRouter('setProductOnSale', { ...admin, id: created.id, onSale: false }).product.onSale, false)
  assert.equal(mockRouter('deleteProduct', { ...admin, id: created.id }).product.deletedAt > 0, true)
})

test('ordinary users cannot mutate products', () => {
  assert.throws(() => mockRouter('createProduct', { openid: 'mock-user', phone: '13800000000', product: { name: 'x' } }), /无管理权限/)
})
