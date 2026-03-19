import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { AuthRepository } from '@/adapters/outbound/prisma/repositories/auth-repository'
import { LoginUseCase } from '@/core/use-cases/auth/login-user'
import { JwtService } from '@/shared/infra/auth/jwt'
import { env } from '@/config/env'
import { loginSchema } from './schema'
import { Trace } from '../../../decorators/trace-decorator'

export class LoginUserController {
  private authRepository: AuthRepository
  private organizationsRepository: OrganizationsRepository
  private jwtService: JwtService

  private useCase: LoginUseCase

  constructor() {
    this.authRepository = new AuthRepository()
    this.organizationsRepository = new OrganizationsRepository()
    this.jwtService = new JwtService(env.JWT_SECRET)

    this.useCase = new LoginUseCase(
      this.authRepository,
      this.organizationsRepository,
      this.jwtService
    )
  }

  @Route('POST', '/auth/sso/login')
  @Trace('auth.sso_login')
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = loginSchema.parse(request.body)

    const response = await this.useCase.execute(payload)

    return reply.status(200).send(response)
  }
}

export const loginUserController = new LoginUserController()
