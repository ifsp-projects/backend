import { GetOrganizationProfileByIdUseCaseReturn } from './types'
import { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { OrganizationProfileDoesNotExistError } from '@/core/domain/exceptions/organizations-profiles'

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
