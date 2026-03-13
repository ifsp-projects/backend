import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { GetInviteByTokenUseCaseReturn } from './types'
import { InviteTokenDoesNotExistError } from '@/core/domain/exceptions/admin'

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
