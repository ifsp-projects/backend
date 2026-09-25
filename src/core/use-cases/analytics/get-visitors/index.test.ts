import { describe, expect, it, vi } from 'vitest'

import type { VisitorsEvent } from '@/adapters/outbound/posthog/visitors-query'

import {
  GetVisitorsUseCase,
  VisitorsForbiddenError,
  VisitorsSlugNotFoundError
} from '.'
import type { GetVisitorsDependencies } from './types'

const event = (timestamp: string, distinctId: string): VisitorsEvent => ({
  timestamp,
  distinctId,
  referrer: null,
  deviceType: 'Mobile'
})

const current = [
  event('2026-09-23T12:00:00.000Z', 'one'),
  event('2026-09-23T13:00:00.000Z', 'one'),
  event('2026-09-22T12:00:00.000Z', 'two')
]

const setup = () => {
  const findOwnership = vi.fn(async (slug: string) =>
    slug === 'missing'
      ? null
      : { ong_id: slug === 'one' ? 'org-one' : 'org-two' }
  )
  const queryEvents = vi.fn(async ({ startUtc }: { startUtc: string }) =>
    startUtc === '2026-09-17T03:00:00.000Z'
      ? current
      : [event('2026-09-16T12:00:00.000Z', 'older')]
  )
  const dependencies: GetVisitorsDependencies = {
    findOwnership,
    queryEvents,
    getConfig: () => ({
      apiHost: 'https://us.posthog.com',
      projectId: 'project',
      apiKey: 'secret',
      publicHost: 'capivara-solidaria.com.br'
    }),
    now: () => new Date('2026-09-24T12:00:00.000Z')
  }
  return {
    useCase: new GetVisitorsUseCase(dependencies),
    findOwnership,
    queryEvents
  }
}

describe('GetVisitorsUseCase', () => {
  it('returns period metrics, completed days and a null hourly series', async () => {
    const { useCase } = setup()
    const { response, cacheHit } = await useCase.execute({
      organizationId: 'org-one',
      request: { slug: 'one', range: '7d' }
    })
    expect(cacheHit).toBe(false)
    expect(response).toMatchObject({
      range: '7d',
      timezone: 'America/Sao_Paulo',
      period_start: '2026-09-17',
      period_end: '2026-09-23',
      selected_date: null,
      unique_visitors: 2,
      pageviews: 3,
      previous_unique_visitors: 1,
      change_pct: 100,
      views_per_visitor: 1.5,
      hourly: null,
      peak_hour: null,
      period_highlights: {
        best_day: '2026-09-23',
        average_daily_pageviews: 0.43
      }
    })
    expect(response.daily).toHaveLength(7)
    expect(response.daily[0]).toEqual({
      date: '2026-09-17',
      visitors: 0,
      pageviews: 0
    })
    expect(response.sources).toEqual([
      { kind: 'unknown', domain: null, pageviews: 3, share_pct: 100 }
    ])
    expect(response.devices[0]).toEqual({
      type: 'mobile',
      pageviews: 3,
      share_pct: 100
    })
  })

  it('keeps period daily context but uses the selected day for active metrics', async () => {
    const { useCase } = setup()
    const result = await useCase.execute({
      organizationId: 'org-one',
      request: { slug: 'one', range: '7d', date: '2026-09-23' }
    })
    expect(result.response.selected_date).toBe('2026-09-23')
    expect(result.response.daily).toHaveLength(7)
    expect(result.response).toMatchObject({
      unique_visitors: 1,
      pageviews: 2,
      previous_unique_visitors: 1,
      change_pct: 0,
      peak_hour: 9
    })
    expect(result.response.hourly).toHaveLength(24)
    expect(result.response.sources).toEqual([
      { kind: 'unknown', domain: null, pageviews: 2, share_pct: 100 }
    ])
  })

  it('rejects unknown and foreign slugs before cache or PostHog', async () => {
    const { useCase, queryEvents } = setup()
    await expect(
      useCase.execute({
        organizationId: 'org-one',
        request: { slug: 'missing', range: '7d' }
      })
    ).rejects.toBeInstanceOf(VisitorsSlugNotFoundError)
    await expect(
      useCase.execute({
        organizationId: 'org-one',
        request: { slug: 'two', range: '7d' }
      })
    ).rejects.toBeInstanceOf(VisitorsForbiddenError)
    expect(queryEvents).not.toHaveBeenCalled()
  })

  it('does not turn a necessary query failure into an empty success', async () => {
    const { useCase, queryEvents } = setup()
    queryEvents.mockRejectedValueOnce(new Error('upstream'))
    await expect(
      useCase.execute({
        organizationId: 'org-one',
        request: { slug: 'one', range: '7d' }
      })
    ).rejects.toThrow('upstream')
    expect(
      (
        await useCase.execute({
          organizationId: 'org-one',
          request: { slug: 'one', range: '7d' }
        })
      ).response.pageviews
    ).toBe(3)
  })

  it('starts both external queries together and stamps completion time', async () => {
    let now = new Date('2026-09-24T12:00:00.000Z')
    const resolvers: Array<(value: VisitorsEvent[]) => void> = []
    const queryEvents = vi.fn(
      () =>
        new Promise<VisitorsEvent[]>(resolve => {
          resolvers.push(resolve)
        })
    )
    const useCase = new GetVisitorsUseCase({
      findOwnership: async () => ({ ong_id: 'org-one' }),
      getConfig: () => ({
        apiHost: 'https://us.posthog.com',
        projectId: 'project',
        apiKey: 'secret',
        publicHost: 'capivara-solidaria.com.br'
      }),
      queryEvents,
      now: () => now
    })
    const pending = useCase.execute({
      organizationId: 'org-one',
      request: { slug: 'one', range: '7d' }
    })
    await vi.waitFor(() => expect(queryEvents).toHaveBeenCalledTimes(2))
    now = new Date('2026-09-24T12:00:07.000Z')
    resolvers.forEach(resolve => resolve([]))
    const result = await pending
    expect(result.response.updated_at).toBe('2026-09-24T12:00:07.000Z')
    expect(result.response.pageviews).toBe(0)
  })
})
