import type { VisitorsResponse } from 'capivara-solidaria-ts-sdk'

import type { VisitorsEvent } from '@/adapters/outbound/posthog/visitors-query'

import { VISITORS_TIMEZONE, type VisitorsWindow, shiftDate } from './period'

export type PeriodSummary = Pick<
  VisitorsResponse,
  | 'unique_visitors'
  | 'pageviews'
  | 'views_per_visitor'
  | 'previous_unique_visitors'
  | 'change_pct'
  | 'daily'
  | 'period_highlights'
>

export const eventDate = (timestamp: string): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: VISITORS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(timestamp))

export const uniqueVisitorCount = (events: VisitorsEvent[]): number =>
  new Set(events.map(event => event.distinctId).filter(id => id?.trim())).size

export const rounded = (value: number, places: number): number =>
  Math.round((value + Number.EPSILON) * 10 ** places) / 10 ** places

export const changePercent = (
  current: number,
  previous: number
): number | null =>
  previous === 0
    ? current === 0
      ? 0
      : null
    : rounded(((current - previous) / previous) * 100, 1)

export const summarizePeriod = (
  events: VisitorsEvent[],
  previousEvents: VisitorsEvent[],
  window: VisitorsWindow
): PeriodSummary => {
  const days = window.range === '7d' ? 7 : 30
  const daily = Array.from({ length: days }, (_, index) => {
    const date = shiftDate(window.periodStart, index)
    const dayEvents = events.filter(
      event => eventDate(event.timestamp) === date
    )
    return {
      date,
      visitors: uniqueVisitorCount(dayEvents),
      pageviews: dayEvents.length
    }
  })
  const unique_visitors = uniqueVisitorCount(events)
  const previous_unique_visitors = uniqueVisitorCount(previousEvents)
  const pageviews = events.length
  const bestDay = daily.reduce<string | null>((best, day) => {
    if (day.visitors === 0) return best
    const previousBest = daily.find(point => point.date === best)
    return !previousBest || day.visitors >= previousBest.visitors
      ? day.date
      : best
  }, null)

  return {
    unique_visitors,
    pageviews,
    views_per_visitor:
      unique_visitors === 0 ? 0 : rounded(pageviews / unique_visitors, 2),
    previous_unique_visitors,
    change_pct: changePercent(unique_visitors, previous_unique_visitors),
    daily,
    period_highlights: {
      best_day: bestDay,
      average_daily_pageviews: rounded(pageviews / days, 2)
    }
  }
}
