import type { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { OrganizationProfileDoesNotExistError } from '@/core/domain/exceptions/organizations-profiles'

import type { GetOrganizationProfileByIdUseCaseReturn } from './types'

export class GetOrganizationProfileByIdUseCase {
  constructor(
    protected readonly organizationsProfileRepository: OrganizationsProfilesRepository
  ) {}

  execute = async (
    id: string
  ): Promise<GetOrganizationProfileByIdUseCaseReturn> => {
    const organizationProfile =
      await this.organizationsProfileRepository.getOrganizationProfileById(id)

    if (!organizationProfile) {
      throw new OrganizationProfileDoesNotExistError()
    }

    return {
      organizationProfile
    }
  }
}
