import type { FastifyReply, FastifyRequest } from 'fastify'

import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repository'
import { RegenerateInviteTokenUseCase } from '@/core/use-cases/admin/regenerate-token-and-resend-email'

import { Route } from '../../../decorators/route-decorator'
import { Trace } from '../../../decorators/trace-decorator'
import { verifyAdmin } from '../../../middlewares/verify-admin'
import { regenerateTokenAndResendParamsSchema } from './schema'

export class RegenerateAndResendInviteController {
  private adminRepository: AdminRepository
  private useCase: RegenerateInviteTokenUseCase

  constructor() {
    this.adminRepository = new AdminRepository()
    this.useCase = new RegenerateInviteTokenUseCase(this.adminRepository)
  }

  @Route('POST', '/admin/invites/:id/resend', {
    middlewares: [verifyAdmin]
  })
  @Trace('admin.regenerate_token_and_resend_email')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = regenerateTokenAndResendParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(200).send(response)
  }
}

export const regenerateAndResendInviteController =
  new RegenerateAndResendInviteController()
