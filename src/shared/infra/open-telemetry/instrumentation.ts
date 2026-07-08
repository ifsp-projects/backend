import { FastifyOtelInstrumentation } from '@fastify/otel'
import type { Span } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { NodeSDK } from '@opentelemetry/sdk-node'

// Initialize OpenTelemetry SDK with Fastify-specific instrumentation
const sdk = new NodeSDK({
  instrumentations: [
    // Fastify-specific instrumentation for routes and hooks
    new FastifyOtelInstrumentation({
      registerOnInitialization: true,
      ignorePaths: (requestOptions: { url: string }) => {
        // Ignore health checks and metrics endpoints
        return (
          requestOptions.url === '/health' || requestOptions.url === '/metrics'
        )
      },
      requestHook: (
        span: Span,
        request: { id: any; routeOptions: { url: any }; url: any }
      ) => {
        // Enrich spans with Fastify-specific context
        span.setAttribute('request.id', request.id)
        span.setAttribute(
          'http.route',
          request.routeOptions?.url || request.url
        )
      },
      lifecycleHook: (span: Span, info: { hookName: any }) => {
        span.setAttribute('fastify.hook', info.hookName)
      }
    }),
    // Other auto-instrumentations (database, etc.)
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req: { url: string }) => {
          // Ignore health checks and metrics endpoints
          return req.url === '/health' || req.url === '/metrics'
        },
        requestHook: (
          span: Span,
          request: { headers: { [x: string]: any } }
        ) => {
          // Add custom attributes to HTTP spans
          span.setAttribute(
            'user_agent.original',
            request.headers['user-agent'] || 'unknown'
          )
        },
        responseHook: (
          span: Span,
          response: {
            getHeader: (arg0: string) => any
            headers: { [x: string]: any }
          }
        ) => {
          // Add response-specific attributes
          const contentLength =
            typeof response.getHeader === 'function'
              ? response.getHeader('content-length')
              : response.headers?.['content-length']
          span.setAttribute(
            'http.response.header.content_length',
            contentLength || 0
          )
        }
      },
      '@opentelemetry/instrumentation-fastify': {
        enabled: false // Use @fastify/otel for Fastify instrumentation
      },
      '@opentelemetry/instrumentation-fs': {
        enabled: false // Reduce noise from filesystem operations
      }
    })
  ]
})

// Start the SDK
sdk.start()
console.log('OpenTelemetry instrumentation initialized')

const shutdown = () =>
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    .catch(console.error)
    .finally(() => process.exit(0))

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
