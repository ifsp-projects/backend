import type { FastifyReply, FastifyRequest } from 'fastify'

import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { AuthRepository } from '@/adapters/outbound/prisma/repositories/auth-repository'
import { LogoutUseCase } from '@/core/use-cases/auth/logout-user'

import { Trace } from '../../../decorators/trace-decorator'
import { verifyJWT } from '../../../middlewares/verify-jwt'
import { logoutSchema } from './schema'

export class LogoutUserController {
  private authRepository: AuthRepository

  private useCase: LogoutUseCase

  constructor() {
    this.authRepository = new AuthRepository()

    this.useCase = new LogoutUseCase(this.authRepository)
  }

  @Route('POST', '/auth/sso/logout', {
    middlewares: [verifyJWT]
  })
  @Trace('auth.sso_logout')
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = logoutSchema.parse(request.body)

    const response = await this.useCase.execute(payload)

    return reply.status(200).send(response)
  }
}

export const logoutUserController = new LogoutUserController()
