import type { Attributes } from '@opentelemetry/api'
import { SpanStatusCode, trace } from '@opentelemetry/api'

const tracer = trace.getTracer('capivara-solidaria-backend-api-otel')

export async function withSpan<T>(
  name: string,
  fn: (span: ReturnType<typeof tracer.startSpan>) => Promise<T>,
  attributes?: Attributes
): Promise<T> {
  return tracer.startActiveSpan(
    name,
    { attributes: attributes ?? {} },
    async span => {
      try {
        const result = await fn(span)
        span.setStatus({ code: SpanStatusCode.OK })
        return result
      } catch (err: any) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
        span.recordException(err)
        throw err
      } finally {
        span.end()
      }
    }
  )
}
