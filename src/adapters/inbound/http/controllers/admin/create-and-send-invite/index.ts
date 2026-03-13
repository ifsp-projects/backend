import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { CreateInviteTokenUseCase } from '@/core/use-cases/admin/create-and-send-invite'
import { verifyJWT } from '../../../middlewares/verify-jwt'
import { Route } from '../../../decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAndSendInviteBodySchema } from './schema'

export class CreateAndSendInviteController {
  private adminRepository: AdminRepository
  private useCase: CreateInviteTokenUseCase

  constructor() {
    this.adminRepository = new AdminRepository()
    this.useCase = new CreateInviteTokenUseCase(this.adminRepository)
  }

  @Route('POST', '/admin/invites', {
    middlewares: [verifyJWT]
  })
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = createAndSendInviteBodySchema.parse(request.body)

    const response = await this.useCase.execute(payload)

    return reply.status(201).send(response)
  }
}

export const createAndSendInviteController = new CreateAndSendInviteController()
