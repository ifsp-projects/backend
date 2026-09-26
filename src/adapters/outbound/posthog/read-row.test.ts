import { describe, expect, it } from 'vitest'

import { VisitorsQueryError } from '@/core/domain/exceptions/analytics'

import { readRow } from './read-row'

const VALID_TIMESTAMP = '2024-01-15T10:00:00.000Z'
const VALID_UUID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'

const validRow = (
  overrides: Partial<{
    timestamp: unknown
    uuid: unknown
    distinctId: unknown
    currentUrl: unknown
    referrer: unknown
    deviceType: unknown
  }> = {}
): unknown[] => [
  overrides.timestamp ?? VALID_TIMESTAMP,
  overrides.uuid ?? VALID_UUID,
  'distinctId' in overrides ? overrides.distinctId : 'distinct-1',
  'currentUrl' in overrides ? overrides.currentUrl : 'https://example.com/page',
  'referrer' in overrides ? overrides.referrer : 'https://google.com',
  'deviceType' in overrides ? overrides.deviceType : 'Desktop'
]

describe('readRow', () => {
  it('returns the row when every field is a valid, populated string', () => {
    const row = validRow()

    expect(readRow(row)).toEqual([
      VALID_TIMESTAMP,
      VALID_UUID,
      'distinct-1',
      'https://example.com/page',
      'https://google.com',
      'Desktop'
    ])
  })

  it('returns the row when the nullable fields are all null', () => {
    const row = validRow({
      distinctId: null,
      currentUrl: null,
      referrer: null,
      deviceType: null
    })

    expect(readRow(row)).toEqual([
      VALID_TIMESTAMP,
      VALID_UUID,
      null,
      null,
      null,
      null
    ])
  })

  it('throws VisitorsQueryError when row is not an array', () => {
    expect(() => readRow({ not: 'an array' })).toThrow(VisitorsQueryError)
    expect(() => readRow(null)).toThrow(VisitorsQueryError)
    expect(() => readRow(undefined)).toThrow(VisitorsQueryError)
    expect(() => readRow('row')).toThrow(VisitorsQueryError)
  })

  it('throws VisitorsQueryError when row does not have exactly 6 elements', () => {
    expect(() => readRow(validRow().slice(0, 5))).toThrow(VisitorsQueryError)
    expect(() => readRow([...validRow(), 'extra'])).toThrow(VisitorsQueryError)
    expect(() => readRow([])).toThrow(VisitorsQueryError)
  })

  describe('timestamp (index 0)', () => {
    it('throws when timestamp is not a string', () => {
      expect(() => readRow(validRow({ timestamp: 123 }))).toThrow(
        VisitorsQueryError
      )
      expect(() => readRow(validRow({ timestamp: null }))).toThrow(
        VisitorsQueryError
      )
    })

    it('throws when timestamp is not a parseable date', () => {
      expect(() => readRow(validRow({ timestamp: 'not-a-date' }))).toThrow(
        VisitorsQueryError
      )
      expect(() => readRow(validRow({ timestamp: '' }))).toThrow(
        VisitorsQueryError
      )
    })
  })

  describe('uuid (index 1)', () => {
    it('throws when uuid is not a string', () => {
      expect(() => readRow(validRow({ uuid: 123 }))).toThrow(VisitorsQueryError)
      expect(() => readRow(validRow({ uuid: null }))).toThrow(
        VisitorsQueryError
      )
    })

    it('throws when uuid is an empty string', () => {
      expect(() => readRow(validRow({ uuid: '' }))).toThrow(VisitorsQueryError)
    })
  })
})
