import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import { gunzipSync } from 'node:zlib'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')
const containerName = `capivara-otel-smoke-${process.pid}`
const received = new Map()
const payloads = new Map()
const output = []

function command(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('rtk', ['docker', ...args], { cwd: projectRoot })
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

async function waitFor(check, label, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await check()) return
    await delay(250)
  }
  throw new Error(`Timed out waiting for ${label}`)
}

const sink = createServer((request, response) => {
  const path = request.url
  const chunks = []
  request.on('data', chunk => chunks.push(chunk))
  request.on('end', () => {
    const body = Buffer.concat(chunks)
    const decoded =
      request.headers['content-encoding'] === 'gzip' ? gunzipSync(body) : body
    received.set(path, (received.get(path) ?? 0) + 1)
    payloads.set(path, [...(payloads.get(path) ?? []), decoded])
    response.writeHead(200, { 'content-type': 'application/x-protobuf' })
    response.end()
  })
})
await new Promise(resolve => sink.listen(0, '0.0.0.0', resolve))

let api
try {
  const sinkPort = sink.address().port
  await command([
    'run',
    '-d',
    '--name',
    containerName,
    '-e',
    'DEPLOY_ENV=production',
    '-e',
    `GRAFANA_CLOUD_OTLP_ENDPOINT=http://host.docker.internal:${sinkPort}`,
    '-e',
    'GRAFANA_CLOUD_AUTH_HEADER=dGVzdA==',
    '-p',
    '127.0.0.1::4317',
    '-p',
    '127.0.0.1::4318',
    '-v',
    `${join(projectRoot, 'devops/otel/collector-config.yaml')}:/etc/otel-config.yaml:ro`,
    'otel/opentelemetry-collector-contrib:0.155.0',
    '--config=/etc/otel-config.yaml'
  ])

  const grpcAddress = await command(['port', containerName, '4317/tcp'])
  const grpcPort = Number(grpcAddress.match(/:(\d+)$/)?.[1])
  if (!grpcPort) throw new Error('Could not resolve Collector gRPC port')

  const probe = createServer()
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve))
  const apiPort = probe.address().port
  await new Promise(resolve => probe.close(resolve))

  const env = {
    ...process.env,
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
    OTEL_SERVICE_NAME: 'capivara-solidaria-api',
    OTEL_RESOURCE_ATTRIBUTES:
      'service.namespace=capivara-solidaria,deployment.environment=production',
    OTEL_EXPORTER_OTLP_PROTOCOL: 'grpc',
    OTEL_EXPORTER_OTLP_ENDPOINT: `http://127.0.0.1:${grpcPort}`,
    OTEL_METRIC_EXPORT_INTERVAL: '1000',
    OTEL_TRACES_SAMPLER: 'always_on'
  }
  api = spawn(process.execPath, [join(projectRoot, 'dist/server.js')], {
    cwd: projectRoot,
    env
  })
  api.stdout.on('data', data => output.push(data.toString()))
  api.stderr.on('data', data => output.push(data.toString()))

  await waitFor(
    () => output.join('').includes('HTTP Server Running on port'),
    'API startup'
  )
  const port = Number(
    output.join('').match(/HTTP Server Running on port (\d+)/)?.[1]
  )
  if (!port) throw new Error('API did not expose a port')

  const health = await fetch(`http://127.0.0.1:${port}/health?token=private`)
  const missing = await fetch(
    `http://127.0.0.1:${port}/not-found?token=private`
  )
  if (health.status !== 200 || missing.status !== 404) {
    throw new Error(
      `Unexpected HTTP statuses: ${health.status}, ${missing.status}`
    )
  }

  await waitFor(
    () =>
      ['traces', 'metrics', 'logs'].every(signal =>
        received.has(`/v1/${signal}`)
      ),
    'all three OTLP signals',
    30000
  )
  if (output.join('').includes('token=private')) {
    throw new Error('Sensitive query value appeared in API logs')
  }
  for (const [path, bodies] of payloads) {
    if (Buffer.concat(bodies).includes('token=private')) {
      throw new Error(`Sensitive query value appeared in ${path}`)
    }
  }
  const metricsPayload = Buffer.concat(payloads.get('/v1/metrics'))
  for (const name of [
    'http.server.request.count',
    'http.server.request.duration'
  ]) {
    if (!metricsPayload.includes(name))
      throw new Error(`Missing metric: ${name}`)
  }
  await waitFor(
    () =>
      Buffer.concat(payloads.get('/v1/metrics') ?? []).includes(
        'otelcol_exporter_queue_size'
      ),
    'Collector internal metrics',
    25000
  )
  const traceId = output.join('').match(/"trace_id":"([0-9a-f]{32})"/)?.[1]
  if (!traceId) throw new Error('Request logs lack trace_id')
  const logsPayload = Buffer.concat(payloads.get('/v1/logs') ?? [])
  if (!logsPayload.includes(Buffer.from(traceId, 'hex'))) {
    throw new Error('OTLP logs lack the native trace ID')
  }
  const tracesPayload = Buffer.concat(payloads.get('/v1/traces') ?? [])
  if (!tracesPayload.includes(Buffer.from(traceId, 'hex'))) {
    throw new Error('OTLP traces do not match the log trace ID')
  }
  console.log(
    `Passed: health=${health.status}, missing=${missing.status}, ` +
      [...received].map(([path, count]) => `${path}=${count}`).join(', ')
  )
} catch (error) {
  console.error(error)
  console.error(
    `OTLP requests: ${JSON.stringify(Object.fromEntries(received))}`
  )
  if (api) console.error(output.join('').slice(-4000))
  throw error
} finally {
  if (api) {
    api.kill('SIGTERM')
    await delay(500)
  }
  await command(['rm', '-f', containerName]).catch(() => {})
  await new Promise(resolve => sink.close(resolve))
}
