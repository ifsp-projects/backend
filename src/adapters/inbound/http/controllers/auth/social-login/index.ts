import type { FastifyReply, FastifyRequest } from 'fastify'

import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { env } from '@/config/env'
import { BaseAuth } from '@/core/use-cases/auth/base'
import { SocialLoginUseCase } from '@/core/use-cases/auth/social-login'
import { JwtService } from '@/shared/infra/auth/jwt'

import { Trace } from '../../../decorators/trace-decorator'
import { socialLoginBodySchema } from './schemas'

export class SocialLoginController extends BaseAuth {
  private useCase: SocialLoginUseCase
  organizationsRepository = new OrganizationsRepository()

  constructor() {
    const organizationsRepository = new OrganizationsRepository()
    const jwtService = new JwtService(env.JWT_SECRET)
    super(organizationsRepository, jwtService)

    this.organizationsRepository = organizationsRepository
    this.useCase = new SocialLoginUseCase(organizationsRepository)
  }

  @Route('POST', '/auth/social')
  @Trace('auth.social_login')
  async sociaLogin(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = socialLoginBodySchema.parse(request.body)

    const response = await this.useCase.executeSociaLogin(payload)

    const {
      organization: { id, role, email }
    } = response

    const { token, refreshToken } = await this.signJwtTokens(reply, {
      id,
      email,
      role
    })

    return reply.status(200).send({
      ...response,
      token,
      refreshToken
    })
  }
}

export const socialLoginController = new SocialLoginController()
