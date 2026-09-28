import { FastifyOtelInstrumentation } from '@fastify/otel'
import type { Span } from '@opentelemetry/api'
import { AggregationType } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'

const sdk = new NodeSDK({
  views: [
    {
      instrumentName: 'http.server.request.duration',
      aggregation: {
        type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
        options: {
          boundaries: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
        }
      }
    },
    {
      instrumentName: 'dependency.client.duration',
      aggregation: {
        type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
        options: {
          boundaries: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10]
        }
      }
    }
  ],
  instrumentations: [
    new FastifyOtelInstrumentation({
      registerOnInitialization: true,
      ignorePaths: (requestOptions: { url: string }) => {
        return requestOptions.url.split('?')[0] === '/health'
      },
      requestHook: (
        span: Span,
        request: { id: any; routeOptions: { url: any }; url: any }
      ) => {
        span.setAttribute('request.id', request.id)
        span.setAttribute('http.route', request.routeOptions?.url || 'unknown')
        span.setAttribute('url.path', request.url.split('?')[0])
      },
      lifecycleHook: (span: Span, info: { hookName: any }) => {
        span.setAttribute('fastify.hook', info.hookName)
      }
    })
    // Other auto-instrumentations (database, etc.)
    // getNodeAutoInstrumentations({
    //   '@opentelemetry/instrumentation-http': {
    //     ignoreIncomingRequestHook: (req: { url: string }) => {
    //       // Ignore health checks and metrics endpoints
    //       return req.url === '/health' || req.url === '/metrics'
    //     },
    //     requestHook: (
    //       span: Span,
    //       request: { headers: { [x: string]: any } }
    //     ) => {
    //       // Add custom attributes to HTTP spans
    //       span.setAttribute(
    //         'user_agent.original',
    //         request.headers['user-agent'] || 'unknown'
    //       )
    //     },
    //     responseHook: (
    //       span: Span,
    //       response: {
    //         getHeader: (arg0: string) => any
    //         headers: { [x: string]: any }
    //       }
    //     ) => {
    //       // Add response-specific attributes
    //       const contentLength =
    //         typeof response.getHeader === 'function'
    //           ? response.getHeader('content-length')
    //           : response.headers?.['content-length']
    //       span.setAttribute(
    //         'http.response.header.content_length',
    //         contentLength || 0
    //       )
    //     }
    //   },
    //   '@opentelemetry/instrumentation-fastify': {
    //     enabled: false // Use @fastify/otel for Fastify instrumentation
    //   },
    //   '@opentelemetry/instrumentation-fs': {
    //     enabled: false // Reduce noise from filesystem operations
    //   }
    // })
  ]
})

if (process.env.NODE_ENV === 'production') {
  sdk.start()
  console.log('OpenTelemetry instrumentation initialized')
}

const shutdown = () =>
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    .catch(console.error)
    .finally(() => process.exit(0))

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
