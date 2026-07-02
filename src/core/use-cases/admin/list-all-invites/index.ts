import type { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repository'

import type { ListAllInvitesUseCaseReturn } from './types'

export class ListAllInvitesUseCase {
  constructor(protected readonly adminRepository: AdminRepository) {}

  execute = async (): Promise<ListAllInvitesUseCaseReturn> => {
    const allInvites = await this.adminRepository.listAllInvites()

    return {
      invites: allInvites
    }
  }
}
