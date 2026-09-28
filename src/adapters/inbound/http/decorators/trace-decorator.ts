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
      return withSpan(resolvedName, async span => {
        span.setAttributes({
          'http.request.method': request.method,
          'http.route': request.routeOptions?.url ?? 'unknown'
        })

        request.log.info(
          { method: request.method, route: request.routeOptions?.url },
          `[${resolvedName}] started`
        )

        try {
          const result = await originalMethod.apply(this, [request, reply])

          span.setAttributes({ 'http.response.status_code': reply.statusCode })
          request.log.info(
            { statusCode: reply.statusCode },
            `[${resolvedName}] completed`
          )

          return result
        } catch (err: any) {
          span.setAttributes({ 'http.response.status_code': 500 })
          request.log.error(
            {
              error_type: err?.name ?? 'Error',
              method: request.method,
              route: request.routeOptions?.url
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
