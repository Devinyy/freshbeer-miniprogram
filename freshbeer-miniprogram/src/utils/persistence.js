export function loadPersisted(storage, key, fallback) {
  try {
    const value = storage.getStorageSync(key)
    if (!value) return fallback
    return typeof value === 'string' ? JSON.parse(value) : value
  } catch (_) {
    return fallback
  }
}

export function savePersisted(storage, key, value) {
  storage.setStorageSync(key, JSON.stringify(value))
}
