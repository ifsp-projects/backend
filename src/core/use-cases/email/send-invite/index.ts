import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { SendInviteUseCasePayload, SendInviteUseCaseReturn } from './types'
import { ResendRepository } from '@/shared/infra/email/resend'

export class SendInviteUseCase {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly resendRepository: ResendRepository
  ) {}

  async execute({
    email,
    organization_id
  }: SendInviteUseCasePayload): Promise<SendInviteUseCaseReturn> {
    const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 72)

    const invite = await this.adminRepository.createAndSendInvite({
      email,
      organization_id
    })

    await this.resendRepository.sendInviteEmail({
      to: email,
      token: invite.token,
      organization_id,
      expires_at
    })

    return {
      invite_id: invite.id,
      email: invite.email,
      expires_at: invite.expires_at
    }
  }
}
