import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'

import { NodeSDK } from '@opentelemetry/sdk-node'

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { FastifyOtelInstrumentation } from '@fastify/otel'

import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'

import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'

import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR)

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
  exportIntervalMillis: Number(process.env.OTEL_METRIC_EXPORT_INTERVAL),
  exportTimeoutMillis: Number(process.env.OTEL_METRIC_EXPORT_TIMEOUT)
})

const fastifyOtelInstrumentation = new FastifyOtelInstrumentation({
  registerOnInitialization: true
})

const sdk = new NodeSDK({
  metricReader,
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({}),
    fastifyOtelInstrumentation
  ]
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
