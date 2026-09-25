import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, expect, it, vi } from 'vitest'

let app: FastifyInstance

beforeAll(async () => {
  for (const key of [
    'DATABASE_URL',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'DEBUG',
    'WEBPAGE_BASE_URL',
    'RESEND_API_KEY',
    'APP_URL',
    'EMAIL_FROM',
    'OPENAI_API_KEY',
    'OPENAI_ORGANIZATION_ID',
    'OPENAI_PROJECT_ID'
  ]) {
    vi.stubEnv(key, 'test-value')
  }

  app = (await import('./app')).app
})

afterAll(async () => {
  await app.close()
  vi.unstubAllEnvs()
})

it('responds to the health route without external services', async () => {
  const response = await app.inject({ method: 'GET', url: '/health' })

  expect(response.statusCode).toBe(200)
  expect(response.json()).toEqual({
    name: 'ifsp-project-api',
    status: 'healthy'
  })
})
