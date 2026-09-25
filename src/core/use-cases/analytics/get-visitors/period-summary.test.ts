import { describe, expect, it } from 'vitest'

import type { VisitorsEvent } from '@/adapters/outbound/posthog/visitors-query'

import { getVisitorsWindow } from './period'
import { summarizePeriod } from './period-summary'

const event = (date: string, distinctId: string | null): VisitorsEvent => ({
  timestamp: `${date}T15:00:00.000Z`,
  distinctId,
  referrer: null,
  deviceType: null
})
const window = getVisitorsWindow(
  { slug: 'ong', range: '7d' },
  new Date('2026-09-24T12:00:00Z')
)

describe('period summary', () => {
  it('counts distinct visitors across days and matches the numeric example', () => {
    const current = [
      event('2026-09-17', 'a'),
      event('2026-09-18', 'a'),
      ...Array.from({ length: 7 }, () => event('2026-09-19', 'b')),
      ...Array.from({ length: 5 }, () => event('2026-09-20', 'c'))
    ]
    const result = summarizePeriod(
      current,
      [event('2026-09-10', 'x'), event('2026-09-11', 'y')],
      window
    )
    expect(result.unique_visitors).toBe(3)
    expect(result.pageviews).toBe(14)
    expect(result.views_per_visitor).toBe(4.67)
    expect(result.previous_unique_visitors).toBe(2)
    expect(result.change_pct).toBe(50)
    expect(result.period_highlights).toEqual({
      best_day: '2026-09-20',
      average_daily_pageviews: 2
    })
    expect(result.daily).toEqual([
      { date: '2026-09-17', visitors: 1, pageviews: 1 },
      { date: '2026-09-18', visitors: 1, pageviews: 1 },
      { date: '2026-09-19', visitors: 1, pageviews: 7 },
      { date: '2026-09-20', visitors: 1, pageviews: 5 },
      { date: '2026-09-21', visitors: 0, pageviews: 0 },
      { date: '2026-09-22', visitors: 0, pageviews: 0 },
      { date: '2026-09-23', visitors: 0, pageviews: 0 }
    ])
  })

  it('returns a complete zero series without a best day', () => {
    const result = summarizePeriod([], [], window)
    expect(result.daily).toHaveLength(7)
    expect(
      result.daily.every(point => point.visitors === 0 && point.pageviews === 0)
    ).toBe(true)
    expect(result.unique_visitors).toBe(0)
    expect(result.pageviews).toBe(0)
    expect(result.views_per_visitor).toBe(0)
    expect(result.change_pct).toBe(0)
    expect(result.period_highlights).toEqual({
      best_day: null,
      average_daily_pageviews: 0
    })
  })

  it('chooses the latest tied day and uses null when there is no comparison base', () => {
    const result = summarizePeriod(
      [event('2026-09-17', 'a'), event('2026-09-23', 'b')],
      [],
      window
    )
    expect(result.period_highlights.best_day).toBe('2026-09-23')
    expect(result.change_pct).toBeNull()
  })

  it('fills all 30 days including a month boundary', () => {
    const longWindow = getVisitorsWindow(
      { slug: 'ong', range: '30d' },
      new Date('2026-09-24T12:00:00Z')
    )
    const result = summarizePeriod([], [], longWindow)
    expect(result.daily).toHaveLength(30)
    expect(result.daily[0]!.date).toBe('2026-08-25')
    expect(result.daily[29]!.date).toBe('2026-09-23')
  })

  it('ignores blank IDs while still counting their pageviews', () => {
    const result = summarizePeriod(
      [event('2026-09-17', ''), event('2026-09-17', null)],
      [],
      window
    )
    expect(result.unique_visitors).toBe(0)
    expect(result.pageviews).toBe(2)
    expect(result.views_per_visitor).toBe(0)
  })

  it('groups near-midnight events by Brasília date and reports a decline', () => {
    const current = [
      { ...event('2026-09-18', 'a'), timestamp: '2026-09-18T02:30:00.000Z' }
    ]
    const previous = [event('2026-09-10', 'a'), event('2026-09-10', 'b')]
    const result = summarizePeriod(current, previous, window)
    expect(result.daily[0]).toEqual({
      date: '2026-09-17',
      visitors: 1,
      pageviews: 1
    })
    expect(result.daily[1]).toEqual({
      date: '2026-09-18',
      visitors: 0,
      pageviews: 0
    })
    expect(result.change_pct).toBe(-50)
  })
})
