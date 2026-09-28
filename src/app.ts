import fastify from 'fastify'

import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'

import { addressesRoutes } from './adapters/inbound/http/controllers/addresses/routes'
import { adminRoutes } from './adapters/inbound/http/controllers/admin/routes'
import { analyticsRoutes } from './adapters/inbound/http/controllers/analytics/routes'
import { authRoutes } from './adapters/inbound/http/controllers/auth/routes'
import { campaignRoutes } from './adapters/inbound/http/controllers/campaigns/routes'
import { organizationsProfilesRoutes } from './adapters/inbound/http/controllers/organizations-profiles/routes'
import { organizationsRoutes } from './adapters/inbound/http/controllers/organizations/routes'
import { pagesRoutes } from './adapters/inbound/http/controllers/pages/routes'
import { registerRoutes } from './adapters/inbound/http/decorators/route-decorator'
import { env } from './config/env'
import { getTraceContext } from './config/logger'
import { registerHttpMetrics } from './shared/infra/open-telemetry/http-metrics'

export const disableVisitorsRequestLogging = (request: { url: string }) =>
  request.url.split('?')[0] === '/api/analytics/visitors'

const safeLoggerOptions = {
  mixin: getTraceContext,
  serializers: {
    req: (request: { method: string }) => ({ method: request.method })
  },
  redact: ['req.headers.authorization', 'req.headers.cookie']
}

export const app = fastify({
  disableRequestLogging: disableVisitorsRequestLogging,
  logger:
    process.env.NODE_ENV === 'production'
      ? {
          ...safeLoggerOptions,
          level: 'info',
          transport: {
            targets: [
              { target: 'pino-opentelemetry-transport' },
              { target: 'pino/file', options: { destination: 1 } }
            ]
          }
        }
      : {
          ...safeLoggerOptions,
          level: 'debug',
          transport: {
            targets: [
              {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'HH:MM:ss',
                  ignore: 'pid,hostname'
                }
              }
            ]
          }
        },
  connectionTimeout: 600000, // 10 minutes
  keepAliveTimeout: 605000, // 10 minutes + 5 seconds buffer
  requestTimeout: 600000 // 10 minutes for the entire request
})

registerHttpMetrics(app)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Cookie'
  ],
  credentials: true,
  exposedHeaders: ['Set-Cookie']
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: true
  },
  sign: {
    expiresIn: '7d'
  }
})

app.register(fastifyCookie, {
  secret: env.JWT_SECRET
})

registerRoutes(app, organizationsRoutes)
registerRoutes(app, organizationsProfilesRoutes)
registerRoutes(app, addressesRoutes)
registerRoutes(app, pagesRoutes)
registerRoutes(app, authRoutes)
registerRoutes(app, adminRoutes)
registerRoutes(app, analyticsRoutes)
registerRoutes(app, campaignRoutes)

app.get('/health', (_, reply) => {
  return reply.send({
    name: 'ifsp-project-api',
    status: 'healthy'
  })
})

app.get('/favicon.ico', (request, reply) => {
  return reply.status(204).send()
})

app.setNotFoundHandler((_request, reply) => {
  return reply.status(404).send({ message: 'Not Found' })
})
