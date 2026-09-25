import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  ENV: z.enum(['dev', 'prod']).default('dev'),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  DEBUG: z.string(),
  WEBPAGE_BASE_URL: z.string(),
  RESEND_API_KEY: z.string(),
  APP_URL: z.string(),
  EMAIL_FROM: z.string(),
  OPENAI_API_KEY: z.string(),
  OPENAI_ORGANIZATION_ID: z.string(),
  OPENAI_PROJECT_ID: z.string()
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid Environment Variables', parsed.error.format())

  throw new Error('Invalid Environment Variables.')
}

export const env = {
  ...parsed.data,
  IS_DEVELOP_MODE: parsed.data.ENV === 'dev'
}

const analyticsIntegrationSchema = z.object({
  POSTHOG_API_HOST: z.url(),
  POSTHOG_PROJECT_ID: z.string().trim().min(1),
  POSTHOG_READABLE_API_KEY: z.string().trim().min(1),
  WEBPAGE_BASE_URL: z.url()
})

export class AnalyticsIntegrationUnavailableError extends Error {
  constructor() {
    super('Analytics integration unavailable')
    this.name = 'AnalyticsIntegrationUnavailableError'
  }
}

export const getAnalyticsIntegrationConfig = (
  values: NodeJS.ProcessEnv = process.env
) => {
  const result = analyticsIntegrationSchema.safeParse(values)

  if (!result.success) {
    throw new AnalyticsIntegrationUnavailableError()
  }

  const apiHost = new URL(result.data.POSTHOG_API_HOST)
  const publicUrl = new URL(result.data.WEBPAGE_BASE_URL)

  if (
    apiHost.protocol !== 'https:' ||
    !['us.posthog.com', 'eu.posthog.com'].includes(apiHost.hostname) ||
    apiHost.pathname !== '/' ||
    apiHost.search ||
    apiHost.hash ||
    publicUrl.protocol !== 'https:' ||
    publicUrl.hostname === 'localhost' ||
    publicUrl.pathname !== '/' ||
    publicUrl.search ||
    publicUrl.hash
  ) {
    throw new AnalyticsIntegrationUnavailableError()
  }

  return {
    apiHost: apiHost.origin,
    projectId: result.data.POSTHOG_PROJECT_ID,
    apiKey: result.data.POSTHOG_READABLE_API_KEY,
    publicHost: publicUrl.hostname
  }
}
