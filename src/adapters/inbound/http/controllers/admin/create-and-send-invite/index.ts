import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { CreateInviteTokenUseCase } from '@/core/use-cases/admin/create-and-send-invite'
import { Route } from '../../../decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAndSendInviteBodySchema } from './schema'
import { ResendRepository } from '@/shared/infra/email/resend'
import { SendInviteUseCase } from '@/core/use-cases/email/send-invite'
import { Trace } from '../../../decorators/trace-decorator'
import { verifyAdmin } from '../../../middlewares/verify-admin'

export class CreateAndSendInviteController {
  private adminRepository: AdminRepository
  private resendRepository: ResendRepository

  private createInviteTokenUseCase: CreateInviteTokenUseCase
  private sendEmailUseCase: SendInviteUseCase

  constructor() {
    this.adminRepository = new AdminRepository()
    this.resendRepository = new ResendRepository()

    this.createInviteTokenUseCase = new CreateInviteTokenUseCase(
      this.adminRepository
    )
    this.sendEmailUseCase = new SendInviteUseCase(
      this.adminRepository,
      this.resendRepository
    )
  }

  @Route('POST', '/admin/invites', {
    middlewares: [verifyAdmin]
  })
  @Trace('admin.create_and_send_invite')
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = createAndSendInviteBodySchema.parse(request.body)

    const response = await this.createInviteTokenUseCase.execute(payload)

    await this.sendEmailUseCase.execute({
      invite_token: response.inviteToken.token
    })

    return reply.status(201).send(response)
  }
}

export const createAndSendInviteController = new CreateAndSendInviteController()
