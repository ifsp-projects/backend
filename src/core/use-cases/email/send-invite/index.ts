import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { SendInviteUseCasePayload, SendInviteUseCaseReturn } from './types'
import { ResendRepository } from '@/shared/infra/email/resend'
import { InviteNotFound } from '@/core/domain/exceptions/invites'

export class SendInviteUseCase {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly resendRepository: ResendRepository
  ) { }

  async execute({
    invite_token,
  }: SendInviteUseCasePayload): Promise<SendInviteUseCaseReturn> {
    const invite = await this.adminRepository.getInviteByToken(invite_token)

    if (!invite) {
      throw new InviteNotFound()
    }

    await this.resendRepository.sendInviteEmail({
      to: invite.email,
      token: invite.token,
      organization_id: invite.organization_id,
      expires_at: invite.expires_at
    })

    return {
      invite_id: invite.id,
      email: invite.email,
      expires_at: invite.expires_at
    }
  }
}
