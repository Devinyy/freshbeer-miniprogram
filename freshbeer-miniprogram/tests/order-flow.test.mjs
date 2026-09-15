import test from 'node:test'
import assert from 'node:assert/strict'
import { mockRouter, resetMockState } from '../src/utils/mock.js'

test('余额支付后订单进入备货状态并保留骑手信息', () => {
  resetMockState()
  const created = mockRouter('createOrder', {
    items: [{ productId: 'p2', price: 14, qty: 3, spec: '' }],
    address: { name: '测试用户', phone: '13800000000', detail: '测试地址' },
    discount: 0
  })

  const paid = mockRouter('payOrder', { orderId: created.order.orderId, method: 'balance' })

  assert.equal(paid.order.status, 'preparing')
  assert.ok(paid.order.paidAt)
  assert.equal(mockRouter('getOrder', { orderId: created.order.orderId }).order.status, 'preparing')
})

test('已支付订单申请退款后进入退款处理中且不可重复申请', () => {
  resetMockState()
  const created = mockRouter('createOrder', {
    items: [{ productId: 'p2', price: 14, qty: 3, spec: '' }],
    address: { name: '测试用户', phone: '13800000000', detail: '测试地址' },
    discount: 0
  })
  mockRouter('payOrder', { orderId: created.order.orderId })

  const refunded = mockRouter('refundOrder', {
    orderId: created.order.orderId,
    reason: '不想要了',
    amount: created.order.payable
  })

  assert.equal(refunded.order.status, 'refund_pending')
  assert.equal(refunded.order.refundStatus, 'pending')
  assert.throws(
    () => mockRouter('refundOrder', { orderId: created.order.orderId, reason: '重复申请' }),
    /退款申请处理中/
  )
})
