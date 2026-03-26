import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { RegenerateInviteTokenUseCaseReturn } from './types'
import {
  InviteTokenAlreadyUsedError,
  InviteTokenDoesNotExistError
} from '@/core/domain/exceptions/admin'

export class RegenerateInviteTokenUseCase {
  constructor(protected readonly adminRepository: AdminRepository) {}

  execute = async (id: string): Promise<RegenerateInviteTokenUseCaseReturn> => {
    const inviteTokenExists = await this.adminRepository.getInviteTokenById(id)

    if (!inviteTokenExists) {
      throw new InviteTokenDoesNotExistError()
    }

    if (inviteTokenExists.used_at) {
      throw new InviteTokenAlreadyUsedError()
    }

    const refreshedToken = await this.adminRepository.regenerateAndResendToken(
      id
    )

    if (!refreshedToken) {
      throw new InviteTokenDoesNotExistError()
    }

    return {
      inviteToken: refreshedToken
    }
  }
}
