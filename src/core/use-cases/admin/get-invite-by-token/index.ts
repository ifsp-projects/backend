import type { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repository'
import { InviteTokenDoesNotExistError } from '@/core/domain/exceptions/admin'

import type { GetInviteByTokenUseCaseReturn } from './types'

export class GetInviteByTokenUseCase {
  constructor(protected readonly adminRepository: AdminRepository) {}

  execute = async (token: string): Promise<GetInviteByTokenUseCaseReturn> => {
    const inviteToken = await this.adminRepository.getInviteByToken(token)

    if (!inviteToken) {
      throw new InviteTokenDoesNotExistError()
    }

    return {
      inviteToken: inviteToken
    }
  }
}
