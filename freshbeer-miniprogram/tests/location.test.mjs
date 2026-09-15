import test from 'node:test'
import assert from 'node:assert/strict'
import { isWithinDeliveryRange } from '../src/utils/location.js'

test('detects whether a coordinate is within the three-kilometre delivery range', () => {
  assert.equal(isWithinDeliveryRange({ lat: 31.186, lng: 121.443 }, { lat: 31.19, lng: 121.44 }, 3000), true)
  assert.equal(isWithinDeliveryRange({ lat: 31.186, lng: 121.443 }, { lat: 31.25, lng: 121.443 }, 3000), false)
})
