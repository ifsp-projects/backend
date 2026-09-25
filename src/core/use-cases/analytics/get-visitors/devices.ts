import type { VisitorsDevice } from 'capivara-solidaria-ts-sdk'

import type { VisitorsEvent } from '@/adapters/outbound/posthog/visitors-query'

import { rounded } from './period-summary'

const deviceType = (value: string | null): VisitorsDevice['type'] => {
  switch (value?.trim().toLowerCase()) {
    case 'mobile':
      return 'mobile'
    case 'desktop':
      return 'desktop'
    case 'tablet':
      return 'tablet'
    default:
      return 'unknown'
  }
}

export const classifyDevices = (events: VisitorsEvent[]): VisitorsDevice[] => {
  const counts: Record<VisitorsDevice['type'], number> = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
    unknown: 0
  }
  for (const event of events) counts[deviceType(event.deviceType)]++
  return (['mobile', 'desktop', 'tablet', 'unknown'] as const).map(type => ({
    type,
    pageviews: counts[type],
    share_pct:
      events.length === 0 ? 0 : rounded((counts[type] / events.length) * 100, 1)
  }))
}
