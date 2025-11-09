import { OrganizationsRepository } from '@/core/ports/repositories/prisma/organization-repository'
import { BaseAuth } from '@/core/use-cases/auth/base'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'

export class RefreshTokenController extends BaseAuth {
  organizationsRepository = new OrganizationsRepository()

  constructor() {
    const organizationsRepository = new OrganizationsRepository()
    super(organizationsRepository)
    this.organizationsRepository = organizationsRepository
  }

  @Route('POST', '/refresh-token')
  async refreshToken(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { token, refreshToken } = await this.signJwtTokens(reply, {
      id: request.user.sub
    })

    return reply.status(200).send({
      token,
      refreshToken
    })
  }
}

export const refreshTokenController = new RefreshTokenController()
