import type { FastifyReply, FastifyRequest } from 'fastify'

import { env } from '@/config/env'
import { JwtService } from '@/shared/infra/auth/jwt'

const jwtService = new JwtService(env.JWT_SECRET)

export async function verifyAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(403).send({ message: 'Unauthorized' })
    }

    const token = authHeader.slice(7)
    const data = jwtService.verifyToken(token)

    if (data.role !== 'admin') {
      return reply.status(403).send({
        message: 'Forbidden'
      })
    }

    request.profile = {
      ...request.profile,
      role: data.role
    }
  } catch {
    request.log.warn({ auth_method: 'admin_jwt' }, 'authentication failed')
    return reply.status(403).send({
      message: 'Forbidden'
    })
  }
}
