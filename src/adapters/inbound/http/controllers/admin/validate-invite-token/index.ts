import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { Route } from '../../../decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { validateInviteTokenParamsSchema } from './schema'
import { ValidateInviteTokenUseCase } from '@/core/use-cases/admin/validate-invite-token'
import { Trace } from '../../../decorators/trace-decorator'
import { verifyAdmin } from '../../../middlewares/verify-admin'

export class ValidateInviteTokenController {
  private adminRepository: AdminRepository
  private useCase: ValidateInviteTokenUseCase

  constructor() {
    this.adminRepository = new AdminRepository()
    this.useCase = new ValidateInviteTokenUseCase(this.adminRepository)
  }

  @Route('GET', '/admin/invites/validate/:token', {
    middlewares: [verifyAdmin]
  })
  @Trace('admin.validate_invite_token')
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { token } = validateInviteTokenParamsSchema.parse(request.params)

    const response = await this.useCase.execute(token)

    return reply.status(200).send(response)
  }
}

export const validateInviteTokenController = new ValidateInviteTokenController()
