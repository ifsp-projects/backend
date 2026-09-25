import type { VisitorsResponse } from 'capivara-solidaria-ts-sdk'

export type VisitorsCacheKey = {
  projectId: string
  organizationId: string
  slug: string
  range: string
  periodStart: string
  periodEnd: string
  selectedDate: string | null
}

type Entry = { value: VisitorsResponse; expiresAt: number }

export class VisitorsCache {
  private readonly entries = new Map<string, Entry>()
  private readonly pending = new Map<string, Promise<VisitorsResponse>>()

  constructor(private readonly now: () => number = Date.now) {}

  async getOrLoad(
    key: VisitorsCacheKey,
    load: () => Promise<VisitorsResponse>
  ): Promise<{ value: VisitorsResponse; cacheHit: boolean }> {
    const serialized = JSON.stringify(key)
    const existing = this.entries.get(serialized)
    if (existing && existing.expiresAt > this.now()) {
      this.entries.delete(serialized)
      this.entries.set(serialized, existing)
      return { value: existing.value, cacheHit: true }
    }
    this.entries.delete(serialized)
    const inFlight = this.pending.get(serialized)
    if (inFlight) return { value: await inFlight, cacheHit: true }

    const promise = load()
    this.pending.set(serialized, promise)
    try {
      const value = await promise
      for (const [entryKey, entry] of this.entries) {
        if (entry.expiresAt <= this.now()) this.entries.delete(entryKey)
      }
      this.entries.set(serialized, { value, expiresAt: this.now() + 600_000 })
      if (this.entries.size > 500) {
        const oldest = this.entries.keys().next().value
        if (oldest !== undefined) this.entries.delete(oldest)
      }
      return { value, cacheHit: false }
    } finally {
      this.pending.delete(serialized)
    }
  }
}
