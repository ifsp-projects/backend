import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { ListAllInvitesUseCase } from '@/core/use-cases/admin/list-all-invites'
import { Trace } from '../../../decorators/trace-decorator'
import { verifyAdmin } from '../../../middlewares/verify-admin'

export class ListAllInvitesController {
  private adminRepository: AdminRepository
  private useCase: ListAllInvitesUseCase

  constructor() {
    this.adminRepository = new AdminRepository()
    this.useCase = new ListAllInvitesUseCase(this.adminRepository)
  }

  @Route('GET', '/admin/invites', {
    middlewares: [verifyAdmin]
  })
  @Trace('admin.list_all_invites')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const response = await this.useCase.execute()

    return reply.status(200).send(response)
  }
}

export const listAllInvitesController = new ListAllInvitesController()
