import type { FastifyReply, FastifyRequest } from 'fastify'

import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repository'
import { AuthRepository } from '@/adapters/outbound/prisma/repositories/auth-repository'
import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { env } from '@/config/env'
import { ResetPasswordAndLoginUseCase } from '@/core/use-cases/auth/change-password'
import { JwtService } from '@/shared/infra/auth/jwt'

import { Trace } from '../../../decorators/trace-decorator'
import { changePasswordBodySchema } from './schema'

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
