import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { AuthRepository } from '@/adapters/outbound/prisma/repositories/auth-repository'
import { JwtService } from '@/shared/infra/auth/jwt'
import { env } from '@/config/env'
import { changePasswordBodySchema } from './schema'
import { ResetPasswordAndLoginUseCase } from '@/core/use-cases/auth/change-password'
import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { Trace } from '../../../decorators/trace-decorator'

export class ChangePasswordController {
  private authRepository: AuthRepository
  private organizationsRepository: OrganizationsRepository
  private adminRepository: AdminRepository
  private jwtService: JwtService

  private useCase: ResetPasswordAndLoginUseCase

  constructor() {
    this.authRepository = new AuthRepository()
    this.organizationsRepository = new OrganizationsRepository()
    this.adminRepository = new AdminRepository()
    this.jwtService = new JwtService(env.JWT_SECRET)

    this.useCase = new ResetPasswordAndLoginUseCase(
      this.authRepository,
      this.organizationsRepository,
      this.adminRepository,
      this.jwtService
    )
  }

  @Route('POST', '/auth/sso/reset-password')
  @Trace('auth.sso_change_password')
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = changePasswordBodySchema.parse(request.body)

    const response = await this.useCase.execute(payload)

    return reply.status(200).send(response)
  }
}

export const changePasswordController = new ChangePasswordController()
