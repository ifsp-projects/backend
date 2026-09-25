import { describe, expect, it } from 'vitest'

import { VisitorsRateLimit, VisitorsRateLimitError } from './rate-limit'

describe('VisitorsRateLimit', () => {
  it('allows 30 requests per organization and gives retry seconds on the 31st', () => {
    let now = 0
    const limit = new VisitorsRateLimit(() => now)
    for (let index = 0; index < 30; index++) limit.check('one')
    now = 1_000
    expect(() => limit.check('one')).toThrowError(
      new VisitorsRateLimitError(59)
    )
    expect(() => limit.check('two')).not.toThrow()
    now = 60_000
    expect(() => limit.check('one')).not.toThrow()
  })
})
