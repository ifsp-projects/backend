import { describe, expect, it } from 'vitest'

import type { VisitorsEvent } from '@/adapters/outbound/posthog/visitors-query'

import { summarizeDay } from './day-summary'
import { getVisitorsWindow } from './period'

const event = (
  timestamp: string,
  distinctId: string | null
): VisitorsEvent => ({
  timestamp,
  distinctId,
  referrer: null,
  deviceType: null
})

describe('day summary', () => {
  it('fills all 24 Brasília hours and chooses the earliest tied peak', () => {
    const result = summarizeDay(
      [
        event('2026-09-18T03:10:00Z', 'a'),
        event('2026-09-18T03:20:00Z', 'a'),
        event('2026-09-18T05:10:00Z', 'a'),
        event('2026-09-18T05:20:00Z', 'b')
      ],
      [event('2026-09-17T03:10:00Z', 'c')]
    )
    expect(result.hourly).toHaveLength(24)
    expect(result.hourly[0]).toEqual({ hour: 0, visitors: 1, pageviews: 2 })
    expect(result.hourly[1]).toEqual({ hour: 1, visitors: 0, pageviews: 0 })
    expect(result.hourly[2]).toEqual({ hour: 2, visitors: 2, pageviews: 2 })
    expect(result.hourly[23]).toEqual({ hour: 23, visitors: 0, pageviews: 0 })
    expect(result.unique_visitors).toBe(2)
    expect(result.pageviews).toBe(4)
    expect(result.views_per_visitor).toBe(2)
    expect(result.previous_unique_visitors).toBe(1)
    expect(result.change_pct).toBe(100)
    expect(result.peak_hour).toBe(0)
  })

  it('returns zero hours and no peak for an empty day', () => {
    const result = summarizeDay([], [])
    expect(result.hourly).toEqual(
      Array.from({ length: 24 }, (_, hour) => ({
        hour,
        visitors: 0,
        pageviews: 0
      }))
    )
    expect(result.unique_visitors).toBe(0)
    expect(result.pageviews).toBe(0)
    expect(result.views_per_visitor).toBe(0)
    expect(result.change_pct).toBe(0)
    expect(result.peak_hour).toBeNull()
  })

  it('compares the first period day with its preceding day outside the visible range', () => {
    const window = getVisitorsWindow(
      { slug: 'ong', range: '7d', date: '2026-09-17' },
      new Date('2026-09-24T12:00:00Z')
    )
    expect(window.previousDayStartUtc).toBe('2026-09-16T03:00:00.000Z')
    const result = summarizeDay(
      [event('2026-09-17T03:00:00Z', 'a')],
      [event('2026-09-16T03:00:00Z', 'b'), event('2026-09-16T05:00:00Z', 'c')]
    )
    expect(result.previous_unique_visitors).toBe(2)
    expect(result.change_pct).toBe(-50)
  })

  it('reports no comparison base when yesterday had no visitors', () => {
    const result = summarizeDay([event('2026-09-17T03:00:00Z', 'a')], [])
    expect(result.change_pct).toBeNull()
  })
})
