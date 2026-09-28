import { trace } from '@opentelemetry/api'

export function getTraceContext() {
  const span = trace.getActiveSpan()
  if (!span) return {}

  const { traceId, spanId, traceFlags } = span.spanContext()
  return {
    trace_id: traceId,
    span_id: spanId,
    trace_flags: traceFlags
  }
}
