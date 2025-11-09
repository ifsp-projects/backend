interface CacheItem<T> {
  expiry: number
  value: T
}

export class MemoryCache<T> {
  private cache: Map<string, CacheItem<T>> = new Map()
  private readonly defaultTtl: number

  constructor(ttlInSeconds = 3600) {
    // Default 1 hour
    this.defaultTtl = ttlInSeconds
  }

  set(key: string, value: T, ttl = this.defaultTtl): void {
    const expiry = Date.now() + ttl * 1000
    this.cache.set(key, { value, expiry })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}
