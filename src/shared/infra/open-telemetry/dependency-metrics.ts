import { SpanStatusCode, metrics, trace } from '@opentelemetry/api'

const meter = metrics.getMeter('capivara-solidaria-api')
const tracer = trace.getTracer('capivara-solidaria-api-dependencies')
const duration = meter.createHistogram('dependency.client.duration', {
  description: 'Duration of outbound dependency requests',
  unit: 's'
})
const requests = meter.createCounter('dependency.client.requests', {
  description: 'Number of outbound dependency requests'
})

export function observeDependency<T>(
  dependency: 'posthog' | 'resend',
  operation: string,
  callback: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(
    `dependency.${dependency}.${operation}`,
    async span => {
      const started = performance.now()
      let outcome = 'success'
      span.setAttributes({
        'peer.service': dependency,
        'dependency.operation': operation
      })
      try {
        return await callback()
      } catch (error) {
        outcome = 'failure'
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'Dependency request failed'
        })
        span.recordException({
          name: error instanceof Error ? error.name : 'Error',
          message: 'Dependency request failed'
        })
        throw error
      } finally {
        const attributes = {
          'dependency.name': dependency,
          'dependency.operation': operation,
          outcome
        }
        requests.add(1, attributes)
        duration.record((performance.now() - started) / 1000, attributes)
        span.end()
      }
    }
  )
}
