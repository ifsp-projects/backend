import { describe, expect, it } from 'vitest'

import {
  AnalyticsIntegrationUnavailableError,
  getAnalyticsIntegrationConfig
} from './index'

const configured = {
  POSTHOG_API_HOST: 'https://us.posthog.com',
  POSTHOG_PROJECT_ID: '123',
  POSTHOG_READABLE_API_KEY: 'secret-key',
  WEBPAGE_BASE_URL: 'https://capivara.org.br'
}

describe('analytics integration config', () => {
  it('returns server-only connection details for a private PostHog API host', () => {
    expect(getAnalyticsIntegrationConfig(configured)).toEqual({
      apiHost: 'https://us.posthog.com',
      projectId: '123',
      apiKey: 'secret-key',
      publicHost: 'capivara.org.br'
    })
  })

  it('reports missing configuration as integration unavailability', () => {
    expect(() => getAnalyticsIntegrationConfig({})).toThrow(
      AnalyticsIntegrationUnavailableError
    )
  })

  it('rejects an ingestion host in place of the private Query API host', () => {
    expect(() =>
      getAnalyticsIntegrationConfig({
        ...configured,
        POSTHOG_API_HOST: 'https://us.i.posthog.com'
      })
    ).toThrow(AnalyticsIntegrationUnavailableError)
  })

  it('rejects a local site as the production page host', () => {
    expect(() =>
      getAnalyticsIntegrationConfig({
        ...configured,
        WEBPAGE_BASE_URL: 'http://localhost:3000'
      })
    ).toThrow(AnalyticsIntegrationUnavailableError)
  })
})
