import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('./write-runtime-env.mjs', import.meta.url))
const configured = {
  DATABASE_URL: 'postgresql://user:p=a#b@db.example/app',
  JWT_SECRET: 'jwt=$value',
  GOOGLE_CLIENT_ID: 'google-id',
  WEBPAGE_BASE_URL: 'https://example.com',
  RESEND_API_KEY: 'resend-key',
  APP_URL: 'https://example.com',
  EMAIL_FROM: 'noreply@example.com',
  OPENAI_API_KEY: 'openai-key',
  POSTHOG_READABLE_API_KEY: 'posthog-key',
  POSTHOG_API_HOST: 'https://us.posthog.com',
  POSTHOG_PROJECT_ID: '123',
  GRAFANA_CLOUD_OTLP_ENDPOINT: 'https://otlp.example.com/otlp',
  GRAFANA_CLOUD_AUTH_HEADER: 'base64payload'
}

async function run(values) {
  const cwd = await mkdtemp(join(tmpdir(), 'runtime-env-'))
  const result = spawnSync(process.execPath, [script], {
    cwd,
    env: { ...configured, ...values },
    encoding: 'utf8'
  })
  return { cwd, result }
}

test('writes only the app and collector values as literal Docker env lines', async () => {
  const { cwd, result } = await run({})
  try {
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.stdout, '')
    const app = await readFile(join(cwd, 'deploy/app/.env'), 'utf8')
    const otel = await readFile(join(cwd, 'deploy/otel/.env'), 'utf8')
    assert.match(app, /^DATABASE_URL=postgresql:\/\/user:p=a#b@db.example\/app$/m)
    assert.match(app, /^JWT_SECRET=jwt=\$value$/m)
    assert.match(app, /^NODE_ENV=production$/m)
    assert.doesNotMatch(app, /GRAFANA_CLOUD_AUTH_HEADER/)
    assert.match(otel, /^GRAFANA_CLOUD_AUTH_HEADER=base64payload$/m)
    assert.doesNotMatch(otel, /DATABASE_URL/)
    if (process.platform !== 'win32') {
      assert.equal((await stat(join(cwd, 'deploy/app/.env'))).mode & 0o777, 0o600)
    }
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
})

test('rejects missing inputs without creating either file', async () => {
  const { cwd, result } = await run({ JWT_SECRET: '' })
  try {
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /JWT_SECRET/)
    await assert.rejects(readFile(join(cwd, 'deploy/app/.env')))
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
})

test('rejects multiline secrets before writing files', async () => {
  const { cwd, result } = await run({ JWT_SECRET: 'line1\nline2' })
  try {
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /JWT_SECRET must be a single-line value/)
    assert.doesNotMatch(result.stderr, /line1/)
    await assert.rejects(readFile(join(cwd, 'deploy/app/.env')))
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
})
