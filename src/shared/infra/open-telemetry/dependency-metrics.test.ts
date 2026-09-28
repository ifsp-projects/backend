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

afterAll(async () => {
  await provider.shutdown()
  metrics.disable()
})

it('counts successful and failed dependency calls with fixed labels', async () => {
  const { observeDependency } = await import('./dependency-metrics')

  await expect(
    observeDependency('posthog', 'query', async () => 42)
  ).resolves.toBe(42)
  await expect(
    observeDependency('resend', 'send_invite', async () => {
      throw new Error('private provider detail')
    })
  ).rejects.toThrow('private provider detail')

  await provider.forceFlush()
  const points = exporter
    .getMetrics()
    .flatMap(resource => resource.scopeMetrics)
    .flatMap(scope => scope.metrics)
    .find(
      metric => metric.descriptor.name === 'dependency.client.requests'
    )?.dataPoints

  expect(points?.map(point => point.attributes)).toEqual(
    expect.arrayContaining([
      {
        'dependency.name': 'posthog',
        'dependency.operation': 'query',
        outcome: 'success'
      },
      {
        'dependency.name': 'resend',
        'dependency.operation': 'send_invite',
        outcome: 'failure'
      }
    ])
  )
})
