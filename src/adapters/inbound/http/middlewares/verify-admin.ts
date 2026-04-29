import { FastifyReply, FastifyRequest } from 'fastify'
import { JwtService } from '@/shared/infra/auth/jwt'
import { env } from '@/config/env'

const jwtService = new JwtService(env.JWT_SECRET)

export async function verifyAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(403).send({ message: 'Unauthorized' })
    }

    const token = authHeader.slice(7)
    const data = jwtService.verifyToken(token)

    if (data.role !== 'admin') {
      return reply.status(403).send({
        message: 'Forbidden',
      })
    }

    request.profile = {
      ...request.profile,
      role: data.role
    }
  } catch (err) {
    console.log('Error verifying admin token:', err)
    return reply.status(403).send({
      message: 'Forbidden',
    })
  }
}
