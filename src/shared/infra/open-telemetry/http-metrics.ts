import type { FastifyInstance, FastifyRequest } from 'fastify'

import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('capivara-solidaria-api')
const requestDuration = meter.createHistogram('http.server.request.duration', {
  description: 'Duration of completed HTTP requests',
  unit: 's'
})
const requestCount = meter.createCounter('http.server.request.count', {
  description: 'Number of completed HTTP requests'
})
const startedAt = new WeakMap<FastifyRequest, number>()

export function registerHttpMetrics(app: FastifyInstance): void {
  app.addHook('onRequest', (request, _reply, done) => {
    startedAt.set(request, performance.now())
    done()
  })

  app.addHook('onResponse', (request, reply, done) => {
    const started = startedAt.get(request)
    startedAt.delete(request)
    if (started !== undefined) {
      const attributes = {
        'http.request.method': request.method,
        'http.route': request.routeOptions?.url ?? 'unmatched',
        'http.response.status_code': reply.statusCode
      }
      requestCount.add(1, attributes)
      requestDuration.record((performance.now() - started) / 1000, attributes)
    }
    done()
  })
}
