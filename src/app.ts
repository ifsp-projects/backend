import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'

import { env } from './utils/env'

import fastifyJwt from '@fastify/jwt'

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



app.get('/', (_, reply) => {
  return reply.send({
    name: 'ifsp-project-api',
    status: 'healthy'
  })
})
