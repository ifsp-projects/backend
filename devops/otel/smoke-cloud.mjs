import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const containerName = `capivara-otel-cloud-smoke-${process.pid}`
const serviceName = 'capivara-cloud-smoke'
const required = [
  'GRAFANA_CLOUD_OTLP_ENDPOINT',
  'GRAFANA_CLOUD_AUTH_HEADER',
  'GRAFANA_URL',
  'GRAFANA_SERVICE_ACCOUNT_TOKEN'
]
const missing = required.filter(key => !process.env[key])
if (missing.length)
  throw new Error(`Missing configuration: ${missing.join(', ')}`)
if (new URL(process.env.GRAFANA_CLOUD_OTLP_ENDPOINT).protocol !== 'https:') {
  throw new Error('Cloud OTLP endpoint must use HTTPS')
}
const otlpBase = process.env.GRAFANA_CLOUD_OTLP_ENDPOINT
const authProbe = await fetch(
  new URL('v1/metrics', otlpBase.endsWith('/') ? otlpBase : `${otlpBase}/`),
  {
    method: 'POST',
    headers: {
      Authorization: `Basic ${process.env.GRAFANA_CLOUD_AUTH_HEADER}`,
      'Content-Type': 'application/x-protobuf'
    },
    body: Buffer.alloc(0),
    signal: AbortSignal.timeout(15000)
  }
)
if (authProbe.status === 401 || authProbe.status === 403) {
  throw new Error(
    `Grafana Cloud rejected OTLP credentials: HTTP ${authProbe.status}`
  )
}
if (!authProbe.ok) {
  throw new Error(`Grafana Cloud OTLP probe failed: HTTP ${authProbe.status}`)
}

function docker(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('rtk', ['docker', ...args], { cwd: root })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', data => (stdout += data))
    child.stderr.on('data', data => (stderr += data))
    child.on('error', reject)
    child.on('close', code =>
      code === 0
        ? resolve(stdout.trim())
        : reject(new Error(`docker ${args[0]} failed: ${stderr.trim()}`))
    )
  })
}

async function waitFor(check, label, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const result = await check()
    if (result) return result
    await delay(1000)
  }
  throw new Error(`Timed out waiting for ${label}`)
}

async function query(path) {
  const response = await fetch(new URL(path, process.env.GRAFANA_URL), {
    headers: {
      Authorization: `Bearer ${process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN}`
    },
    signal: AbortSignal.timeout(15000)
  })
  if (!response.ok) return { status: response.status, count: 0 }
  const data = await response.json()
  return { status: response.status, count: data.data?.result?.length ?? 0 }
}

let api
let output = ''
try {
  await docker([
    'run',
    '-d',
    '--name',
    containerName,
    '-e',
    'DEPLOY_ENV=cloud-smoke',
    '-e',
    'GRAFANA_CLOUD_OTLP_ENDPOINT',
    '-e',
    'GRAFANA_CLOUD_AUTH_HEADER',
    '-p',
    '127.0.0.1::4317',
    '-v',
    `${join(root, 'devops/otel/collector-config.yaml')}:/etc/otel-config.yaml:ro`,
    'otel/opentelemetry-collector-contrib:0.155.0',
    '--config=/etc/otel-config.yaml'
  ])

  const grpcAddress = await docker(['port', containerName, '4317/tcp'])
  const grpcPort = Number(grpcAddress.match(/:(\d+)$/)?.[1])
  if (!grpcPort) throw new Error('Could not resolve Collector gRPC port')

  const probe = createServer()
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve))
  const apiPort = probe.address().port
  await new Promise(resolve => probe.close(resolve))

  const env = {
    PATH: process.env.PATH,
    SystemRoot: process.env.SystemRoot,
    TEMP: process.env.TEMP,
    TMP: process.env.TMP,
    NODE_ENV: 'production',
    ENV: 'prod',
    PORT: String(apiPort),
    DATABASE_URL: 'postgresql://test:test@127.0.0.1:1/test',
    JWT_SECRET: 'local-smoke-secret',
    GOOGLE_CLIENT_ID: 'local-smoke',
    DEBUG: 'false',
    WEBPAGE_BASE_URL: 'https://example.invalid',
    RESEND_API_KEY: 'local-smoke',
    APP_URL: 'https://example.invalid',
    EMAIL_FROM: 'smoke@example.invalid',
    OPENAI_API_KEY: 'local-smoke',
    OPENAI_ORGANIZATION_ID: 'local-smoke',
    OPENAI_PROJECT_ID: 'local-smoke',
    OTEL_SERVICE_NAME: serviceName,
    OTEL_RESOURCE_ATTRIBUTES:
      'service.namespace=capivara-solidaria,deployment.environment=cloud-smoke',
    OTEL_EXPORTER_OTLP_PROTOCOL: 'grpc',
    OTEL_EXPORTER_OTLP_ENDPOINT: `http://127.0.0.1:${grpcPort}`,
    OTEL_METRIC_EXPORT_INTERVAL: '1000',
    OTEL_TRACES_SAMPLER: 'always_on'
  }
  api = spawn(process.execPath, [join(root, 'dist/server.js')], {
    cwd: root,
    env
  })
  api.stdout.on('data', data => (output += data.toString()))
  api.stderr.on('data', data => (output += data.toString()))

  await waitFor(
    () => output.includes('HTTP Server Running on port'),
    'API startup'
  )
  const port = Number(output.match(/HTTP Server Running on port (\d+)/)?.[1])
  if (!port) throw new Error('API did not expose a port')

  const health = await fetch(`http://127.0.0.1:${port}/health`)
  const missingRoute = await fetch(
    `http://127.0.0.1:${port}/cloud-smoke-missing`
  )
  if (health.status !== 200 || missingRoute.status !== 404) {
    throw new Error(
      `Unexpected HTTP statuses: ${health.status}, ${missingRoute.status}`
    )
  }
  await delay(12000)

  const traceId = output.match(/"trace_id":"([0-9a-f]{32})"/)?.[1]
  if (!traceId) throw new Error('No trace ID in API logs')

  const promQuery = `http_server_request_count_total{job="capivara-solidaria/${serviceName}"}`
  const promPath =
    '/api/datasources/proxy/uid/grafanacloud-prom/api/v1/query?query=' +
    encodeURIComponent(promQuery)
  const lokiQuery = `{service_name="${serviceName}"}`
  const lokiPath =
    '/api/datasources/proxy/uid/grafanacloud-logs/loki/api/v1/query_range?query=' +
    encodeURIComponent(lokiQuery) +
    '&limit=1&start=' +
    BigInt(Date.now() - 600000) * 1000000n
  const tracePath = `/api/datasources/proxy/uid/grafanacloud-traces/api/traces/${traceId}`

  let metrics
  let logs
  let traceStatus
  await waitFor(
    async () => {
      metrics = await query(promPath)
      logs = await query(lokiPath)
      const trace = await fetch(new URL(tracePath, process.env.GRAFANA_URL), {
        headers: {
          Authorization: `Bearer ${process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN}`
        },
        signal: AbortSignal.timeout(15000)
      })
      traceStatus = trace.status
      return metrics.count > 0 && logs.count > 0 && traceStatus === 200
    },
    'metrics, logs, and trace in Grafana Cloud',
    120000
  ).catch(error => {
    console.error(
      `Cloud query result: metrics=${metrics?.status}/${metrics?.count}, ` +
        `logs=${logs?.status}/${logs?.count}, trace=${traceStatus}`
    )
    throw error
  })
  console.log(
    `Cloud verified: metrics=${metrics.count}, logs=${logs.count}, trace=200`
  )
} finally {
  if (api) {
    api.kill('SIGTERM')
    await delay(500)
  }
  await docker(['rm', '-f', containerName]).catch(() => {})
}
