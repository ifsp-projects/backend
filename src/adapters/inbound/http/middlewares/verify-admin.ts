import { FastifyReply, FastifyRequest } from 'fastify'
import { JwtService } from '@/shared/infra/auth/jwt'
import { env } from '@/config/env'

const jwtService = new JwtService(env.JWT_SECRET)

export async function verifyAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    console.log('a')

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('b')
      return reply.status(403).send({ message: 'Unauthorized' })
    }

    console.log('c')
    const token = authHeader.slice(7)
    console.log('d')
    const data = jwtService.verifyToken(token)

    console.log('e')
    if (data.role !== 'admin') {
      console.log('f')
      return reply.status(403).send({
        message: 'Forbidden',
      })
    }

    console.log('g')
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
