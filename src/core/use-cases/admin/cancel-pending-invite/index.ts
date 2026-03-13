import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import {
  InviteTokenAlreadyCancelledError,
  InviteTokenAlreadyUsedError,
  InviteTokenDoesNotExistError
} from '@/core/domain/exceptions/admin'

export class CancelPendingInviteUseCase {
  constructor(protected readonly adminRepository: AdminRepository) {}

  execute = async (id: string): Promise<null> => {
    const inviteExists = await this.adminRepository.getInviteTokenById(id)

    if (!inviteExists) {
      throw new InviteTokenDoesNotExistError()
    }

    if (inviteExists.cancelled_at) {
      throw new InviteTokenAlreadyCancelledError()
    }

    if (inviteExists.used_at) {
      throw new InviteTokenAlreadyUsedError()
    }

    if (inviteExists.expires_at) {
      throw new InviteTokenAlreadyCancelledError()
    }

    await this.adminRepository.cancelPendingInvite(id)

    return null
  }
}
