export class VisitorsRateLimitError extends Error {
  constructor(readonly retryAfter: number) {
    super('Too many visitors requests')
  }
}

type Window = { count: number; expiresAt: number }

export class VisitorsRateLimit {
  private readonly windows = new Map<string, Window>()

  constructor(private readonly now: () => number = Date.now) {}

  check(organizationId: string): void {
    const now = this.now()
    for (const [id, window] of this.windows) {
      if (window.expiresAt <= now) this.windows.delete(id)
    }
    const window = this.windows.get(organizationId)
    if (!window) {
      this.windows.set(organizationId, { count: 1, expiresAt: now + 60_000 })
      return
    }
    if (window.count >= 30) {
      throw new VisitorsRateLimitError(
        Math.ceil((window.expiresAt - now) / 1000)
      )
    }
    window.count++
  }
}
