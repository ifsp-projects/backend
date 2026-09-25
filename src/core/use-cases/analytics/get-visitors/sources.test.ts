import { describe, expect, it } from 'vitest'

import type { VisitorsEvent } from '@/adapters/outbound/posthog/visitors-query'

import { classifySources } from './sources'

const event = (referrer: string | null): VisitorsEvent => ({
  timestamp: '2026-09-18T15:00:00Z',
  distinctId: 'id',
  referrer,
  deviceType: null
})

describe('visitors sources', () => {
  it('normalizes domains, ranks top three, and keeps every pageview accounted for', () => {
    const sources = classifySources(
      [
        event('https://WWW.ZED.COM/path?email=private'),
        event('https://zed.com/another'),
        event('https://alpha.com/x'),
        event('https://beta.com/y'),
        event('https://gamma.com/z'),
        event('https://www.capivara.org.br/ongs/my-ong'),
        event(null),
        event('not-a-url')
      ],
      'capivara.org.br'
    )
    expect(sources).toEqual([
      { kind: 'external', domain: 'zed.com', pageviews: 2, share_pct: 25 },
      { kind: 'external', domain: 'alpha.com', pageviews: 1, share_pct: 12.5 },
      { kind: 'external', domain: 'beta.com', pageviews: 1, share_pct: 12.5 },
      { kind: 'internal', domain: null, pageviews: 1, share_pct: 12.5 },
      { kind: 'other', domain: null, pageviews: 1, share_pct: 12.5 },
      { kind: 'unknown', domain: null, pageviews: 2, share_pct: 25 }
    ])
    expect(sources.reduce((sum, source) => sum + source.pageviews, 0)).toBe(8)
    expect(JSON.stringify(sources)).not.toContain('private')
    expect(JSON.stringify(sources)).not.toContain('/path')
  })

  it('returns no sources for an empty slice', () => {
    expect(classifySources([], 'capivara.org.br')).toEqual([])
  })

  it('classifies only the events in the selected slice', () => {
    const sources = classifySources(
      [event('https://day.example/a')],
      'capivara.org.br'
    )
    expect(sources).toEqual([
      { kind: 'external', domain: 'day.example', pageviews: 1, share_pct: 100 }
    ])
  })
})
