import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import {
  InviteTokenAlreadyUsedError,
  InviteTokenAlreadyCancelledError,
  InviteTokenDoesNotExistError
} from '@/core/domain/exceptions/admin'

export class UseInviteTokenUseCase {
  constructor(protected readonly adminRepository: AdminRepository) {}

  execute = async (token: string): Promise<null> => {
    const inviteToken = await this.adminRepository.getInviteByToken(token)

    if (!inviteToken) {
      throw new InviteTokenDoesNotExistError()
    }

    if (inviteToken.cancelled_at) {
      throw new InviteTokenAlreadyCancelledError()
    }

    if (inviteToken.used_at) {
      throw new InviteTokenAlreadyUsedError()
    }

    await this.adminRepository.useInviteToken(token)

    return null
  }
}
