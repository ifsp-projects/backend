import type { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'

import type { GetOrganizationProfileByEmailUseCaseReturn } from './types'

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
