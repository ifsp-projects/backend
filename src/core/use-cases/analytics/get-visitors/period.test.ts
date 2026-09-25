import { describe, expect, it } from 'vitest'

import {
  InvalidVisitorsFilterError,
  getVisitorsWindow,
  parseVisitorsRequest
} from './period'

describe('visitors period', () => {
  it('uses complete Brasília days for both presets', () => {
    const now = new Date('2026-09-24T15:00:00Z')
    expect(getVisitorsWindow({ slug: 'ong', range: '7d' }, now)).toMatchObject({
      periodStart: '2026-09-17',
      periodEnd: '2026-09-23',
      startUtc: '2026-09-17T03:00:00.000Z',
      endUtc: '2026-09-24T03:00:00.000Z',
      previousStartUtc: '2026-09-10T03:00:00.000Z'
    })
    expect(getVisitorsWindow({ slug: 'ong', range: '30d' }, now)).toMatchObject(
      {
        periodStart: '2026-08-25',
        periodEnd: '2026-09-23',
        endUtc: '2026-09-24T03:00:00.000Z'
      }
    )
  })

  it('handles year changes and selected-day bounds', () => {
    const window = getVisitorsWindow(
      { slug: 'ong', range: '7d', date: '2025-12-25' },
      new Date('2026-01-01T12:00:00Z')
    )
    expect(window).toMatchObject({
      periodStart: '2025-12-25',
      periodEnd: '2025-12-31',
      selectedStartUtc: '2025-12-25T03:00:00.000Z',
      selectedEndUtc: '2025-12-26T03:00:00.000Z',
      previousDayStartUtc: '2025-12-24T03:00:00.000Z'
    })
    expect(() =>
      getVisitorsWindow(
        { slug: 'ong', range: '7d', date: '2026-01-01' },
        new Date('2026-01-01T12:00:00Z')
      )
    ).toThrow(InvalidVisitorsFilterError)
  })

  it.each(['2026-02-30', '2026-09-16', '2026-09-24'])(
    'rejects invalid or outside date %s',
    date => {
      expect(() =>
        getVisitorsWindow(
          { slug: 'ong', range: '7d', date },
          new Date('2026-09-24T15:00:00Z')
        )
      ).toThrow(InvalidVisitorsFilterError)
    }
  )

  it.each([
    'slug=',
    'slug=a/b',
    'slug=a%20b',
    'slug=x&slug=y',
    'slug=x&range=90d',
    'slug=x&range=7d&date=2026-02-30',
    'slug=x&range=7d&range=30d',
    'slug=x&range=7d&date=2026-09-23&date=2026-09-22'
  ])('rejects malformed filters %s', query => {
    expect(() => parseVisitorsRequest(new URLSearchParams(query))).toThrow(
      InvalidVisitorsFilterError
    )
  })
})
