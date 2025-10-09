import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await request.jwtVerify<{ sub: string }>()

    request.user = { sub: data.sub }
  } catch (err) {
    reply.status(401).send({
      message: 'Unauthorized'
    })
  }
}
