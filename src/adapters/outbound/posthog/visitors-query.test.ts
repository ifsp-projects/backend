import { describe, expect, it, vi } from 'vitest'

import { VisitorsQueryError, queryVisitorsEvents } from './visitors-query'

const config = {
  apiHost: 'https://us.posthog.com',
  projectId: '123',
  apiKey: 'private-key',
  publicHost: 'capivara.org.br'
}
const input = {
  slug: 'my-ong',
  startUtc: '2026-09-17T03:00:00.000Z',
  endUtc: '2026-09-24T03:00:00.000Z',
  config
}
const row = (url: unknown = 'https://capivara.org.br/ongs/my-ong') => [
  '2026-09-18T12:00:00.000Z',
  'uuid-1',
  'visitor-1',
  url,
  null,
  'Mobile'
]
const response = (
  results: unknown,
  ok = true,
  hasMore: boolean | null = null
) => ({ ok, json: async () => ({ results, hasMore }) }) as Response

describe('PostHog visitors query', () => {
  it('uses a parameterized pageview query and excludes inexact URLs', async () => {
    const fetcher = vi.fn(async () =>
      response([
        row(),
        row('https://capivara.org.br/ongs/my-ong/?source=test'),
        row('https://capivara.org.br/ongs/my-ong-extra'),
        row('bad URL')
      ])
    ) as unknown as typeof fetch
    const events = await queryVisitorsEvents({ ...input, fetcher })
    expect(events).toEqual([
      {
        timestamp: '2026-09-18T12:00:00.000Z',
        distinctId: 'visitor-1',
        referrer: null,
        deviceType: 'Mobile'
      },
      {
        timestamp: '2026-09-18T12:00:00.000Z',
        distinctId: 'visitor-1',
        referrer: null,
        deviceType: 'Mobile'
      }
    ])
    const [url, options] = vi.mocked(fetcher).mock.calls[0]!
    expect(url).toBe('https://us.posthog.com/api/projects/123/query/')
    expect(options?.headers).toEqual({
      Authorization: 'Bearer private-key',
      'Content-Type': 'application/json'
    })
    const body = JSON.parse(String(options?.body))
    expect(body.query.kind).toBe('HogQLQuery')
    expect(body.query.query).toContain("event = '$pageview'")
    expect(body.query.query).not.toContain('my-ong')
    expect(body.query.values).toEqual({
      startSeconds: 1790132400 - 6 * 86400,
      endSeconds: 1790218800,
      urlPrefix: 'https://capivara.org.br/ongs/my-ong',
      cursorTimestamp: '2026-09-17T03:00:00.000Z',
      cursorUuid: ''
    })
  })

  it.each([
    ['HTTP failure', async () => response([], false)],
    ['malformed payload', async () => response('invalid')],
    [
      'malformed row',
      async () =>
        response([
          [
            'bad-date',
            'uuid',
            'id',
            'https://capivara.org.br/ongs/my-ong',
            null,
            null
          ]
        ])
    ],
    [
      'network failure',
      async () => {
        throw new Error('private diagnostic')
      }
    ]
  ])('sanitizes %s', async (_label, fetcher) => {
    await expect(
      queryVisitorsEvents({ ...input, fetcher: fetcher as typeof fetch })
    ).rejects.toEqual(new VisitorsQueryError())
  })

  it('continues with the timestamp and UUID cursor when more rows exist', async () => {
    const second = [...row(), 'unused']
    second.splice(6)
    second[0] = '2026-09-19T12:00:00.000Z'
    second[1] = 'uuid-2'
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response([row()], true, true))
      .mockResolvedValueOnce(response([second])) as unknown as typeof fetch
    const events = await queryVisitorsEvents({ ...input, fetcher })
    expect(events).toHaveLength(2)
    const body = JSON.parse(String(vi.mocked(fetcher).mock.calls[1]![1]?.body))
    expect(body.query.values.cursorTimestamp).toBe('2026-09-18T12:00:00.000Z')
    expect(body.query.values.cursorUuid).toBe('uuid-1')
    expect(body.query.query).not.toContain('OFFSET')
  })

  it('uses one total deadline for a hanging request', async () => {
    const fetcher = vi.fn(
      (_url: unknown, options: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          options.signal?.addEventListener('abort', () =>
            reject(new Error('abort with private details'))
          )
        })
    ) as unknown as typeof fetch
    await expect(
      queryVisitorsEvents({ ...input, fetcher, timeoutMs: 5 })
    ).rejects.toEqual(new VisitorsQueryError())
  })
})
