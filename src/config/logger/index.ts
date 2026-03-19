import { trace } from '@opentelemetry/api'

export function getTraceContext() {
  const span = trace.getActiveSpan()
  if (!span) return {}

  const { traceId, spanId, traceFlags } = span.spanContext()
  return { traceId, spanId, sampled: traceFlags === 1 }
}
