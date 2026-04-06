import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { BaseAuth } from '@/core/use-cases/auth/base'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyJWT } from '../../../middlewares/verify-jwt'
import { Trace } from '../../../decorators/trace-decorator'
import { JwtService } from '@/shared/infra/auth/jwt'
import { env } from '@/config/env'

export class RefreshTokenController extends BaseAuth {
  organizationsRepository = new OrganizationsRepository()
  

  constructor() {
    const organizationsRepository = new OrganizationsRepository()
    const jwtService = new JwtService(env.JWT_SECRET)
    super(organizationsRepository, jwtService)

    this.organizationsRepository = organizationsRepository
  }

  @Route('POST', '/auth/social/refresh-token', {
    middlewares: [verifyJWT]
  })
  @Trace('auth.social_refresh_token')
  async refreshToken(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const organizationId = request.user.sub

    const organization = await this.organizationsRepository.getOrganizationById(organizationId)

    if (!organization) {
      return reply.status(401).send({ message: 'Invalid session' })
    }

    const { token, refreshToken } = await this.signJwtTokens(reply, {
      id: request.user.sub,
      email: organization.email,
      role: organization.role
    })

    return reply.status(200).send({
      token,
      refreshToken
    })
  }
}

export const refreshTokenController = new RefreshTokenController()
