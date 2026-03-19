import { getTraceContext } from '@/config/logger'
import { withSpan } from '@/config/tracer'

export function Trace(spanName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const resolvedName = spanName ?? `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (this: any, request: any, reply: any) {
      return withSpan(resolvedName, async (span) => {
        span.setAttributes({
          'http.method': request.method,
          'http.route': request.routeOptions?.url ?? request.url,
          'http.client_ip': request.ip,
          'user.agent': request.headers?.['user-agent'] ?? '',
        })

        if (request.user?.id) {
          span.setAttributes({
            'user.id': request.user.id,
            'user.role': request.user.role ?? 'unknown',
          })
        }

        request.log.info(
          { ...getTraceContext(), method: request.method, url: request.url },
          `[${resolvedName}] started`
        )

        try {
          const result = await originalMethod.apply(this, [request, reply])

          span.setAttributes({ 'http.status_code': reply.statusCode })
          request.log.info(
            { ...getTraceContext(), statusCode: reply.statusCode },
            `[${resolvedName}] completed`
          )

          return result
        } catch (err: any) {
          span.setAttributes({ 'http.status_code': 500 })
          request.log.error(
            {
              ...getTraceContext(),
              err: { message: err.message, stack: err.stack, name: err.name },
              method: request.method,
              url: request.url,
            },
            `[${resolvedName}] failed`
          )
          throw err
        }
      })
    }

    return descriptor
  }
}
