import test from 'node:test'
import assert from 'node:assert/strict'
import { loadPersisted, savePersisted } from '../src/utils/persistence.js'

test('persists and restores serializable store state', () => {
  const data = new Map()
  const storage = {
    getStorageSync: (key) => data.get(key),
    setStorageSync: (key, value) => data.set(key, value)
  }
  const state = { items: [{ productId: 'p1', qty: 2 }], couponId: 'c2' }

  savePersisted(storage, 'cart', state)
  assert.deepEqual(loadPersisted(storage, 'cart', {}), state)
})

test('uses a fallback when persisted state is invalid', () => {
  const storage = { getStorageSync: () => '{not-json}' }
  assert.deepEqual(loadPersisted(storage, 'cart', { items: [] }), { items: [] })
})
