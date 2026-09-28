import { mkdir, writeFile } from 'node:fs/promises'

// Docker run --env-file treats everything after '=' as the literal value.
// Keep this list explicit so adding an application setting requires a review.
const app = {
  NODE_ENV: 'production',
  ENV: 'prod',
  PORT: '8000',
  DEBUG: 'false',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  WEBPAGE_BASE_URL: process.env.WEBPAGE_BASE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  APP_URL: process.env.APP_URL,
  EMAIL_FROM: process.env.EMAIL_FROM,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_ORGANIZATION_ID: process.env.OPENAI_ORGANIZATION_ID ?? '',
  OPENAI_PROJECT_ID: process.env.OPENAI_PROJECT_ID ?? '',
  POSTHOG_READABLE_API_KEY: process.env.POSTHOG_READABLE_API_KEY,
  POSTHOG_API_HOST: process.env.POSTHOG_API_HOST,
  POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID
}

const otel = {
  GRAFANA_CLOUD_OTLP_ENDPOINT: process.env.GRAFANA_CLOUD_OTLP_ENDPOINT,
  GRAFANA_CLOUD_AUTH_HEADER: process.env.GRAFANA_CLOUD_AUTH_HEADER
}

const dashboardRequired = process.env.GRAFANA_URL
  ? [
      'GRAFANA_SERVICE_ACCOUNT_TOKEN',
      'GRAFANA_PROMETHEUS_DATASOURCE_UID',
      'GRAFANA_LOKI_DATASOURCE_UID'
    ]
  : []

const required = [
  ...Object.entries(app).filter(([key]) => !['OPENAI_ORGANIZATION_ID', 'OPENAI_PROJECT_ID'].includes(key)),
  ...Object.entries(otel)
]
const missing = [
  ...required.filter(([, value]) => !value).map(([key]) => key),
  ...dashboardRequired.filter(key => !process.env[key])
]
if (missing.length) {
  throw new Error(`Missing deployment configuration: ${missing.join(', ')}`)
}

function serialize(values) {
  return `${Object.entries(values).map(([key, value]) => {
    if (/[\r\n\0]/.test(value)) {
      throw new Error(`${key} must be a single-line value`)
    }
    return `${key}=${value}`
  }).join('\n')}\n`
}

// Validate both files before writing either one. Never print their contents.
const appContent = serialize(app)
const otelContent = serialize(otel)
await mkdir('deploy/app', { recursive: true })
await mkdir('deploy/otel', { recursive: true })
await writeFile('deploy/app/.env', appContent, { mode: 0o600 })
await writeFile('deploy/otel/.env', otelContent, { mode: 0o600 })
