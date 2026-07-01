import type { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'

import type { DeleteOrganizationProfileUseCaseReturn } from './types'

export class DeleteOrganizationProfileUseCase {
  constructor(
    protected readonly organizationsProfilesRepository: OrganizationsProfilesRepository
  ) {}

  execute = async (
    id: string
  ): Promise<DeleteOrganizationProfileUseCaseReturn> => {
    const organizationProfileAlreadyExists =
      await this.organizationsProfilesRepository.getOrganizationProfileById(id)

    if (!organizationProfileAlreadyExists) {
      throw new OrganizationDoesNotExistError()
    }

    const deletedOrganizationProfile =
      await this.organizationsProfilesRepository.deleteOrganizationProfile(id)

    if (!deletedOrganizationProfile) {
      throw new OrganizationDoesNotExistError()
    }

    return {
      organizationProfile: deletedOrganizationProfile
    }
  }
}
