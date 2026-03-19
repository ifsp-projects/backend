import 'dotenv/config'

import { resourceFromAttributes } from '@opentelemetry/resources'

import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'

import { NodeSDK } from '@opentelemetry/sdk-node'

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { FastifyOtelInstrumentation } from '@fastify/otel'

import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'

import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'

import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'

const isDev = process.env.NODE_ENV !== 'production'

diag.setLogger(
  new DiagConsoleLogger(),
  isDev ? DiagLogLevel.WARN : DiagLogLevel.ERROR
)

if (!process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) {
  console.warn(
    'OpenTelemetry: no endpoint configured, skipping SDK initialization'
  )
  process.exit(0)
}

const metricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
  compression: CompressionAlgorithm.GZIP
})

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
  compression: CompressionAlgorithm.GZIP
})

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis:
    Number(process.env.OTEL_METRIC_EXPORT_INTERVAL) || 30000,
  exportTimeoutMillis: Number(process.env.OTEL_METRIC_EXPORT_TIMEOUT) || 10000
})

const fastifyOtelInstrumentation = new FastifyOtelInstrumentation({
  registerOnInitialization: true
})

const sdk = new NodeSDK({
  metricReader,
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: req =>
          ['/health', '/favicon.ico'].some(p => req.url?.startsWith(p))
      }
    }),
    fastifyOtelInstrumentation
  ],
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'capivara-solidaria-api',
    'deployment.environment': process.env.NODE_ENV ?? 'development'
  })
})

const shutdown = async () => {
  await sdk.shutdown()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
process.on('beforeExit', shutdown)

try {
  sdk.start()
} catch (err) {
  console.error('Failed to start OpenTelemetry SDK', err)
  process.exit(1)
}

export {}
