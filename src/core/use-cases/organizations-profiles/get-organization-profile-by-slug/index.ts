import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'
import { GetOrganizationProfileByEmailUseCaseReturn } from './types'
import { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'

export class GetOrganizationProfileBySlugUseCase {
  constructor(
    protected readonly organizationsProfilesRepository: OrganizationsProfilesRepository
  ) {}

  execute = async (
    slug: string
  ): Promise<GetOrganizationProfileByEmailUseCaseReturn> => {
    const organizationProfile =
      await this.organizationsProfilesRepository.getOrganizationProfileBySlug(
        slug
      )

    if (!organizationProfile) {
      throw new OrganizationDoesNotExistError()
    }

    return {
      organizationProfile
    }
  }
}
