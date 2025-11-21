import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'

import { env } from './config/env'

import fastifyJwt from '@fastify/jwt'
import { registerRoutes } from './adapters/inbound/http/decorators/route-decorator'

import { organizationsRoutes } from './adapters/inbound/http/controllers/organizations/routes'
import { organizationsProfilesRoutes } from './adapters/inbound/http/controllers/organizations-profiles/routes'
import { authRoutes } from './adapters/inbound/http/controllers/auth/routes'
import { addressesRoutes } from './adapters/inbound/http/controllers/addresses/route'
import { pagesRoutes } from './adapters/inbound/http/controllers/pages/routes'

export const app = fastify({
  connectionTimeout: 600000, // 10 minutes
  keepAliveTimeout: 605000, // 10 minutes + 5 seconds buffer
  requestTimeout: 600000 // 10 minutes for the entire request
})

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

app.get('/', (_, reply) => {
  return reply.send({
    name: 'ifsp-project-api',
    status: 'healthy'
  })
})
