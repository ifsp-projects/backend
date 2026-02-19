import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { socialLoginBodySchema } from './schemas'
import { BaseAuth } from '@/core/use-cases/auth/base'
import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { SocialLoginUseCase } from '@/core/use-cases/auth/social-login'

export class SocialLoginController extends BaseAuth {
  private useCase: SocialLoginUseCase
  organizationsRepository = new OrganizationsRepository()

  constructor() {
    const organizationsRepository = new OrganizationsRepository()
    super(organizationsRepository)
    this.organizationsRepository = organizationsRepository
    this.useCase = new SocialLoginUseCase(organizationsRepository)
  }

  @Route('POST', '/social-login')
  async sociaLogin(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = socialLoginBodySchema.parse(request.body)

    const response = await this.useCase.executeSociaLogin(payload)

    const {
      organization: { id }
    } = response

    const { token, refreshToken } = await this.signJwtTokens(reply, { id })

    return reply.status(200).send({
      ...response,
      token,
      refreshToken
    })
  }
}

export const socialLoginController = new SocialLoginController()
