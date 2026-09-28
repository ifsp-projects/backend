import type { FastifyReply, FastifyRequest } from 'fastify'

import { env } from '@/config/env'
import { JwtService } from '@/shared/infra/auth/jwt'

const jwtService = new JwtService(env.JWT_SECRET)

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const token = authHeader.slice(7)
    const data = jwtService.verifyToken(token)

    request.user = { sub: data.sub }
  } catch {
    request.log.warn({ auth_method: 'jwt' }, 'authentication failed')
    reply.status(401).send({
      message: 'Unauthorized'
    })
  }
}
