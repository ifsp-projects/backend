import type { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { OrganizationProfileDoesNotExistError } from '@/core/domain/exceptions/organizations-profiles'

import type { GetAllOrganizationsUseCaseReturn } from './types'

export class GetAllOrganizationsProfilesUseCase {
  constructor(
    protected readonly organizationsProfilesRepository: OrganizationsProfilesRepository
  ) {}

  execute = async (): Promise<GetAllOrganizationsUseCaseReturn> => {
    const data =
      await this.organizationsProfilesRepository.getAllOrganizationsProfiles()

    if (!data) {
      throw new OrganizationProfileDoesNotExistError()
    }

    return {
      organizationsProfiles: data
    }
  }
}
