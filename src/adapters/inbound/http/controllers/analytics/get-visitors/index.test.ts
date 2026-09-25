import fastify from 'fastify'
import { describe, expect, it, vi } from 'vitest'

import { registerRoutes } from '@/adapters/inbound/http/decorators/route-decorator'
import { VisitorsQueryError } from '@/adapters/outbound/posthog/visitors-query'
import { AnalyticsIntegrationUnavailableError } from '@/config/env'
import {
  VisitorsForbiddenError,
  VisitorsSlugNotFoundError
} from '@/core/use-cases/analytics/get-visitors'
import { VisitorsRateLimit } from '@/core/use-cases/analytics/get-visitors/rate-limit'
import { JwtService } from '@/shared/infra/auth/jwt'

import { GetVisitorsController } from '.'

const jwt = new JwtService('test-secret')
const token = (id = 'org-one') =>
  jwt.createToken(id, 'admin@example.org', 'admin', 60_000).token
const url = '/api/analytics/visitors?slug=one&range=7d'

const setup = () => {
  const execute = vi.fn().mockResolvedValue({
    response: { range: '7d', updated_at: '2026-09-24T12:00:00.000Z' },
    cacheHit: false
  })
  const app = fastify({ logger: false })
  registerRoutes(app, [
    new GetVisitorsController({
      useCase: { execute },
      jwt,
      rateLimit: new VisitorsRateLimit()
    })
  ])
  return { app, execute }
}

describe('GET /api/analytics/visitors', () => {
  it('uses the JWT organization id and returns a successful response', async () => {
    const { app, execute } = setup()
    const response = await app.inject({
      url,
      headers: { authorization: `Bearer ${token()}` }
    })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      range: '7d',
      updated_at: '2026-09-24T12:00:00.000Z'
    })
    expect(execute).toHaveBeenCalledWith({
      organizationId: 'org-one',
      request: { slug: 'one', range: '7d' }
    })
    await app.close()
  })

  it.each([undefined, 'Bearer invalid'])(
    'returns 401 as {error} for missing or invalid token',
    async authorization => {
      const { app, execute } = setup()
      const response = await app.inject({
        url,
        headers: authorization ? { authorization } : {}
      })
      expect(response.statusCode).toBe(401)
      expect(response.json()).toEqual({ error: 'Unauthorized' })
      expect(execute).not.toHaveBeenCalled()
      await app.close()
    }
  )

  it.each([
    `${url}&slug=two`,
    `${url}&date=2020-01-01`,
    '/api/analytics/visitors?slug=one&range=90d'
  ])('returns 400 before querying for invalid filters', async badUrl => {
    const { app, execute } = setup()
    const response = await app.inject({
      url: badUrl,
      headers: { authorization: `Bearer ${token()}` }
    })
    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({ error: 'Invalid visitors filter' })
    expect(execute).not.toHaveBeenCalled()
    await app.close()
  })

  it.each([
    [new VisitorsForbiddenError(), 403, 'Forbidden'],
    [new VisitorsSlugNotFoundError(), 404, 'Organization not found'],
    [new VisitorsQueryError(), 502, 'Visitors data is temporarily unavailable'],
    [
      new AnalyticsIntegrationUnavailableError(),
      503,
      'Analytics integration unavailable'
    ],
    [new Error('secret raw error'), 500, 'Internal server error']
  ])('maps errors to sanitized %i response', async (error, status, message) => {
    const { app, execute } = setup()
    execute.mockRejectedValue(error)
    const response = await app.inject({
      url,
      headers: { authorization: `Bearer ${token()}` }
    })
    expect(response.statusCode).toBe(status)
    expect(response.json()).toEqual({ error: message })
    await app.close()
  })

  it('returns 429 with Retry-After after 30 requests from one organization', async () => {
    const { app, execute } = setup()
    const headers = { authorization: `Bearer ${token()}` }
    for (let index = 0; index < 30; index++) {
      expect((await app.inject({ url, headers })).statusCode).toBe(200)
    }
    const response = await app.inject({ url, headers })
    expect(response.statusCode).toBe(429)
    expect(response.json()).toEqual({ error: 'Too many requests' })
    expect(response.headers['retry-after']).toBe('60')
    expect(execute).toHaveBeenCalledTimes(30)
    await app.close()
  })
})
