import type { VisitorsHourlyPoint } from 'capivara-solidaria-ts-sdk'

import type { VisitorsEvent } from '@/adapters/outbound/posthog/visitors-query'

import { VISITORS_TIMEZONE } from './period'
import { changePercent, rounded, uniqueVisitorCount } from './period-summary'

const eventHour = (timestamp: string): number =>
  Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: VISITORS_TIMEZONE,
      hour: '2-digit',
      hourCycle: 'h23'
    }).format(new Date(timestamp))
  )

export const summarizeDay = (
  events: VisitorsEvent[],
  previousDayEvents: VisitorsEvent[]
) => {
  const hourly: VisitorsHourlyPoint[] = Array.from(
    { length: 24 },
    (_, hour) => {
      const hourEvents = events.filter(
        event => eventHour(event.timestamp) === hour
      )
      return {
        hour,
        visitors: uniqueVisitorCount(hourEvents),
        pageviews: hourEvents.length
      }
    }
  )
  const unique_visitors = uniqueVisitorCount(events)
  const previous_unique_visitors = uniqueVisitorCount(previousDayEvents)
  const pageviews = events.length
  const peak = hourly.reduce<VisitorsHourlyPoint | null>(
    (best, point) =>
      point.pageviews > 0 && (!best || point.pageviews > best.pageviews)
        ? point
        : best,
    null
  )

  return {
    unique_visitors,
    previous_unique_visitors,
    pageviews,
    views_per_visitor:
      unique_visitors === 0 ? 0 : rounded(pageviews / unique_visitors, 2),
    change_pct: changePercent(unique_visitors, previous_unique_visitors),
    hourly,
    peak_hour: peak?.hour ?? null
  }
}
