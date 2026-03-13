import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'

import { Route } from '../../../decorators/route-decorator'
import { verifyJWT } from '../../../middlewares/verify-jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { regenerateTokenAndResendParamsSchema } from './schema'
import { RegenerateInviteTokenUseCase } from '@/core/use-cases/admin/regenerate-token-and-resend-email'

export class RegenerateAndResendInviteController {
  private adminRepository: AdminRepository
  private useCase: RegenerateInviteTokenUseCase

  constructor() {
    this.adminRepository = new AdminRepository()
    this.useCase = new RegenerateInviteTokenUseCase(this.adminRepository)
  }

  @Route('POST', '/admin/invites/:id/resend', {
    middlewares: [verifyJWT]
  })
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = regenerateTokenAndResendParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(200).send(response)
  }
}

export const regenerateAndResendInviteController =
  new RegenerateAndResendInviteController()
