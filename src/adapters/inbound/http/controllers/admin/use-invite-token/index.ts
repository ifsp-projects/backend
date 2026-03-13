import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { verifyJWT } from '../../../middlewares/verify-jwt'
import { Route } from '../../../decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { useInviteTokenBodySchema } from './schema'
import { UseInviteTokenUseCase } from '@/core/use-cases/admin/use-invite-token'

export class UseInviteTokenController {
  private adminRepository: AdminRepository
  private useCase: UseInviteTokenUseCase

  constructor() {
    this.adminRepository = new AdminRepository()
    this.useCase = new UseInviteTokenUseCase(this.adminRepository)
  }

  @Route('POST', '/admin/invites/token', {
    middlewares: [verifyJWT]
  })
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { token } = useInviteTokenBodySchema.parse(request.body)

    const response = await this.useCase.execute(token)

    return reply.status(200).send(response)
  }
}

export const useInviteTokenController = new UseInviteTokenController()
