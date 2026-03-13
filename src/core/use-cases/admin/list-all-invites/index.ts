import { AdminRepository } from '@/adapters/outbound/prisma/repositories/admin-repositories'
import { ListAllInvitesUseCaseReturn } from './types'

export class ListAllInvitesUseCase {
  constructor(protected readonly adminRepository: AdminRepository) {}

  execute = async (): Promise<ListAllInvitesUseCaseReturn> => {
    const allInvites = await this.adminRepository.listAllInvites()

    return {
      invites: allInvites
    }
  }
}
