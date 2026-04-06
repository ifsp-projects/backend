import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { Route } from '../../../decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getInviteByTokenParamsSchema } from './schema'
import { GetInviteByTokenUseCase } from '@/core/use-cases/admin/get-invite-by-token'
import { Trace } from '../../../decorators/trace-decorator'

export class GetInviteByTokenController {
  private adminRepository: AdminRepository
  private useCase: GetInviteByTokenUseCase

  constructor() {
    this.adminRepository = new AdminRepository()
    this.useCase = new GetInviteByTokenUseCase(this.adminRepository)
  }

  @Route('GET', '/admin/invites/:token/token', {
    middlewares: []
  })
  @Trace('admin.get_invite_by_token')
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { token } = getInviteByTokenParamsSchema.parse(request.params)

    const response = await this.useCase.execute(token)

    return reply.status(200).send(response)
  }
}

export const getInviteByTokenController = new GetInviteByTokenController()
