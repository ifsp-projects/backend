import type { FastifyReply, FastifyRequest } from 'fastify'

export async function optionalVerifyJWT(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = await request.jwtVerify<{ sub: string }>()

    request.user = { sub: data.sub }
  } catch {
    request.log.debug(
      { auth_method: 'optional_jwt' },
      'optional authentication failed'
    )
  }
}
