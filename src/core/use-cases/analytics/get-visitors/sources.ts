import type { VisitorsSource } from 'capivara-solidaria-ts-sdk'

import type { VisitorsEvent } from '@/adapters/outbound/posthog/visitors-query'

import { rounded } from './period-summary'

const normalizedDomain = (value: string): string =>
  value.toLowerCase().replace(/^www\./, '')

const referrerDomain = (referrer: string | null): string | null => {
  if (!referrer) return null
  try {
    const url = new URL(referrer)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return normalizedDomain(url.hostname)
  } catch {
    return null
  }
}

export const classifySources = (
  events: VisitorsEvent[],
  publicHost: string
): VisitorsSource[] => {
  const external = new Map<string, number>()
  const ownDomain = normalizedDomain(publicHost)
  let internal = 0
  let unknown = 0
  for (const event of events) {
    const domain = referrerDomain(event.referrer)
    if (!domain) unknown++
    else if (domain === ownDomain) internal++
    else external.set(domain, (external.get(domain) ?? 0) + 1)
  }

  const ranked = [...external].sort(
    ([domainA, countA], [domainB, countB]) =>
      countB - countA || domainA.localeCompare(domainB)
  )
  const top = ranked.slice(0, 3)
  const other = ranked.slice(3).reduce((sum, [, count]) => sum + count, 0)
  const share = (pageviews: number) =>
    events.length === 0 ? 0 : rounded((pageviews / events.length) * 100, 1)
  const sources: VisitorsSource[] = top.map(([domain, pageviews]) => ({
    kind: 'external',
    domain,
    pageviews,
    share_pct: share(pageviews)
  }))
  if (internal)
    sources.push({
      kind: 'internal',
      domain: null,
      pageviews: internal,
      share_pct: share(internal)
    })
  if (other)
    sources.push({
      kind: 'other',
      domain: null,
      pageviews: other,
      share_pct: share(other)
    })
  if (unknown)
    sources.push({
      kind: 'unknown',
      domain: null,
      pageviews: unknown,
      share_pct: share(unknown)
    })
  return sources
}
