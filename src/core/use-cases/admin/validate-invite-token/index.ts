import type { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repository'
import {
  InviteTokenAlreadyCancelledError,
  InviteTokenAlreadyUsedError,
  InviteTokenDoesNotExistError
} from '@/core/domain/exceptions/admin'
import type { TokenValidationResponse } from '@/core/domain/ports/interfaces/admin-interface'

export class ValidateInviteTokenUseCase {
  constructor(protected readonly adminRepository: AdminRepository) {}

  execute = async (token: string): Promise<TokenValidationResponse> => {
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

    const validation = await this.adminRepository.validateToken(token)

    return validation
  }
}
