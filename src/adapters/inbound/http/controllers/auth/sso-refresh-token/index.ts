import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { AuthRepository } from '@/adapters/outbound/prisma/repositories/auth-repository'
import { refreshSchema } from './schema'
import { verifyJWT } from '../../../middlewares/verify-jwt'
import { RefreshTokenUseCase } from '@/core/use-cases/auth/sso-refresh-token'
import { JwtService } from '@/shared/infra/auth/jwt'
import { env } from '@/config/env'

export class SSORefreshTokenController {
  private authRepository: AuthRepository
  private jwtService: JwtService

  private useCase: RefreshTokenUseCase

  constructor() {
    this.authRepository = new AuthRepository()
    this.jwtService = new JwtService(env.JWT_SECRET)

    this.useCase = new RefreshTokenUseCase(this.authRepository, this.jwtService)
  }

  @Route('POST', '/auth/sso/refresh-token', {
    middlewares: [verifyJWT]
  })
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = refreshSchema.parse(request.body)

    const response = await this.useCase.execute(payload)

    return reply.status(200).send(response)
  }
}

export const ssoRefreshTokenController = new SSORefreshTokenController()
