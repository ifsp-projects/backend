import { describe, expect, it } from 'vitest'

import type { VisitorsEvent } from '@/adapters/outbound/posthog/visitors-query'

import { classifyDevices } from './devices'

const event = (deviceType: string | null): VisitorsEvent => ({
  timestamp: '2026-09-18T15:00:00Z',
  distinctId: 'id',
  referrer: null,
  deviceType
})

describe('visitors devices', () => {
  it('maps known and unknown devices with additive counts and one-decimal shares', () => {
    const devices = classifyDevices([
      event('Mobile'),
      event(' mobile '),
      event('Desktop'),
      event('Tablet'),
      event('Smart TV'),
      event(null)
    ])
    expect(devices).toEqual([
      { type: 'mobile', pageviews: 2, share_pct: 33.3 },
      { type: 'desktop', pageviews: 1, share_pct: 16.7 },
      { type: 'tablet', pageviews: 1, share_pct: 16.7 },
      { type: 'unknown', pageviews: 2, share_pct: 33.3 }
    ])
    expect(devices.reduce((sum, device) => sum + device.pageviews, 0)).toBe(6)
  })

  it('keeps every category at zero for an empty slice', () => {
    expect(classifyDevices([])).toEqual([
      { type: 'mobile', pageviews: 0, share_pct: 0 },
      { type: 'desktop', pageviews: 0, share_pct: 0 },
      { type: 'tablet', pageviews: 0, share_pct: 0 },
      { type: 'unknown', pageviews: 0, share_pct: 0 }
    ])
  })

  it('uses only the selected slice', () => {
    expect(classifyDevices([event('Tablet')])).toEqual([
      { type: 'mobile', pageviews: 0, share_pct: 0 },
      { type: 'desktop', pageviews: 0, share_pct: 0 },
      { type: 'tablet', pageviews: 1, share_pct: 100 },
      { type: 'unknown', pageviews: 0, share_pct: 0 }
    ])
  })
})
