/**
 * 价格 / 时间 / 数字格式化工具
 */
export function formatPrice(n) {
  const v = Number(n)
  if (isNaN(v)) return '0.0'
  // 整数显示 .0，保留一位小数（鲜啤定价习惯）
  return v.toFixed(1)
}

export function formatMoney(n) {
  const v = Number(n)
  if (isNaN(v)) return '0.00'
  return v.toFixed(2)
}

/** 倒计时秒数 -> mm:ss */
export function formatCountdown(sec) {
  if (sec <= 0) return '00:00'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** 时间戳 -> yyyy-mm-dd hh:mm */
export function formatTime(ts) {
  const d = new Date(ts)
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** 手机号脱敏 */
export function maskPhone(phone) {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/** rpx 转 px（小程序端不直接需要，H5/调试用） */
export function rpx2px(rpx) {
  const info = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
  return (rpx / 750) * info.windowWidth
}
