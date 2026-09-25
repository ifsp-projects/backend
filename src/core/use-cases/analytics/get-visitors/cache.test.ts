import { describe, expect, it, vi } from 'vitest'

import { VisitorsCache, type VisitorsCacheKey } from './cache'

const key: VisitorsCacheKey = {
  projectId: 'project',
  organizationId: 'one',
  slug: 'one',
  range: '7d',
  periodStart: '2026-09-17',
  periodEnd: '2026-09-23',
  selectedDate: null
}

const response = (updated_at: string) => ({ updated_at }) as never

describe('VisitorsCache', () => {
  it('keeps the original response for ten minutes after success', async () => {
    let now = 0
    const cache = new VisitorsCache(() => now)
    const load = vi.fn().mockResolvedValue(response('first'))
    await expect(cache.getOrLoad(key, load)).resolves.toMatchObject({
      cacheHit: false,
      value: { updated_at: 'first' }
    })
    now = 599_999
    load.mockResolvedValue(response('second'))
    await expect(cache.getOrLoad(key, load)).resolves.toMatchObject({
      cacheHit: true,
      value: { updated_at: 'first' }
    })
    now = 600_000
    await expect(cache.getOrLoad(key, load)).resolves.toMatchObject({
      cacheHit: false,
      value: { updated_at: 'second' }
    })
  })

  it('deduplicates concurrent loads and retries after a failure', async () => {
    const cache = new VisitorsCache()
    let reject!: (reason: Error) => void
    const load = vi.fn().mockImplementation(
      () =>
        new Promise((_, fail) => {
          reject = fail
        })
    )
    const first = cache.getOrLoad(key, load)
    const second = cache.getOrLoad(key, load)
    reject(new Error('upstream'))
    await expect(first).rejects.toThrow('upstream')
    await expect(second).rejects.toThrow('upstream')
    await expect(
      cache.getOrLoad(key, async () => response('retry'))
    ).resolves.toMatchObject({
      cacheHit: false,
      value: { updated_at: 'retry' }
    })
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('keys by organization and Brasília day and evicts beyond 500 entries', async () => {
    const cache = new VisitorsCache()
    for (let index = 0; index < 501; index++) {
      await cache.getOrLoad(
        { ...key, organizationId: String(index) },
        async () => response(String(index))
      )
    }
    await expect(
      cache.getOrLoad(key, async () => response('fresh'))
    ).resolves.toMatchObject({ cacheHit: false })
    await expect(
      cache.getOrLoad({ ...key, periodEnd: '2026-09-24' }, async () =>
        response('next day')
      )
    ).resolves.toMatchObject({
      cacheHit: false,
      value: { updated_at: 'next day' }
    })
  })
})
