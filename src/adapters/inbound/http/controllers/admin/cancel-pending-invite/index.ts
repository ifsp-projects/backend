import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { CancelPendingInviteUseCase } from '@/core/use-cases/admin/cancel-pending-invite'
import { Route } from '../../../decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { cancelPendingInviteParamsSchema } from './schema'
import { Trace } from '../../../decorators/trace-decorator'
import { verifyAdmin } from '../../../middlewares/verify-admin'

export class CancelPendingInviteController {
  private adminRepository: AdminRepository
  private useCase: CancelPendingInviteUseCase

  constructor() {
    this.adminRepository = new AdminRepository()
    this.useCase = new CancelPendingInviteUseCase(this.adminRepository)
  }

  @Route('DELETE', '/admin/invites/:id', {
    middlewares: [verifyAdmin]
  })
  @Trace('admin.cancel_pending_invite')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = cancelPendingInviteParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(200).send(response)
  }
}

export const cancelPendingInviteController = new CancelPendingInviteController()
