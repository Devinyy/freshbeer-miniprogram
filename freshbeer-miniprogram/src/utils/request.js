/**
 * 统一云函数调用封装。
 * USE_MOCK=true 时走 mock 数据（保证小程序可独立运行演示）；
 * 配置好 uniCloud 环境后改为 false 即可无缝切换到真实云函数。
 */
import { mockRouter } from './mock'

const USE_MOCK = true

export async function callCloud(name, data = {}) {
  if (!USE_MOCK) {
    // #ifdef MP-WEIXIN
    const res = await uni.cloud.callFunction({ name, data })
    if (res.result && res.result.code === 401) {
      // token 过期：重新登录
    }
    return res.result
    // #endif
  }
  // 模拟网络延迟，体验更接近真实
  await new Promise((r) => setTimeout(r, 180))
  return mockRouter(name, data)
}

export { USE_MOCK }
