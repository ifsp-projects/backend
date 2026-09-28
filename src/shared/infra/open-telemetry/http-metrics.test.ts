import fastify from 'fastify'
import { afterAll, expect, it } from 'vitest'

import { metrics } from '@opentelemetry/api'
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader
} from '@opentelemetry/sdk-metrics'

const exporter = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE)
const provider = new MeterProvider({
  readers: [new PeriodicExportingMetricReader({ exporter })]
})
metrics.setGlobalMeterProvider(provider)

const app = fastify({ logger: false })

afterAll(async () => {
  await app.close()
  await provider.shutdown()
  metrics.disable()
})

it('records status and route template without request identifiers or query values', async () => {
  const { registerHttpMetrics } = await import('./http-metrics')
  registerHttpMetrics(app)
  app.get('/items/:id', async () => ({ ok: true }))

  const response = await app.inject({
    method: 'GET',
    url: '/items/private-id?token=secret'
  })
  expect(response.statusCode).toBe(200)

  await provider.forceFlush()
  const points = exporter
    .getMetrics()
    .flatMap(resource => resource.scopeMetrics)
    .flatMap(scope => scope.metrics)
    .find(
      metric => metric.descriptor.name === 'http.server.request.count'
    )?.dataPoints

  expect(points).toHaveLength(1)
  expect(points?.[0]?.attributes).toEqual({
    'http.request.method': 'GET',
    'http.route': '/items/:id',
    'http.response.status_code': 200
  })
})
