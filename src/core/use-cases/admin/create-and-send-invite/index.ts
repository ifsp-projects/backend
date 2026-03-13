import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { Prisma } from '@prisma-generated'
import {
  CreateInviteTokenUseCasePayload,
  CreateInviteTokenUseCaseReturn
} from './types'

export class CreateInviteTokenUseCase {
  constructor(protected readonly adminRepository: AdminRepository) {}

  execute = async (
    payload: CreateInviteTokenUseCasePayload
  ): Promise<CreateInviteTokenUseCaseReturn> => {
    const inviteToken = await this.adminRepository.createAndSendInvite(payload)

    return {
      inviteToken
    }
  }
}
