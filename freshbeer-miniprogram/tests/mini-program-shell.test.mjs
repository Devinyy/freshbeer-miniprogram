import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

test('all pages use their in-page navigation instead of a duplicate native bar', () => {
  const pages = JSON.parse(read('src/pages.json')).pages
  assert.ok(pages.every((page) => page.style?.navigationStyle === 'custom'))
})

test('the custom tab bar is a native WeChat component that can be registered in build output', () => {
  const config = JSON.parse(read('src/custom-tab-bar/index.json'))
  assert.equal(config.component, true)
  assert.match(read('src/custom-tab-bar/index.js'), /switchTab/)
  assert.match(read('src/custom-tab-bar/index.wxml'), /tabbar/)
})

test('each tab has local SVG assets for selected and unselected states', () => {
  for (const name of ['home', 'category', 'cart', 'order', 'profile']) {
    assert.ok(fs.existsSync(path.join(root, `src/static/tabbar/${name}.svg`)))
    assert.ok(fs.existsSync(path.join(root, `src/static/tabbar/${name}-active.svg`)))
  }
  assert.match(read('src/custom-tab-bar/index.wxml'), /<image/)
})

test('non-tab flow pages use the shared safe-area navigation component', () => {
  assert.match(read('src/components/page-nav/page-nav.vue'), /navigateBack/)
  for (const page of ['address', 'address-edit', 'order-confirm', 'payment', 'order-detail', 'realname', 'refund']) {
    assert.match(read(`src/pages/${page}/${page}.vue`), /<fb-page-nav/)
  }
})
