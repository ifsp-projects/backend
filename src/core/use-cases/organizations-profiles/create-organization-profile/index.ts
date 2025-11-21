import { Prisma } from '@prisma/client'
import { CreateOrganizationProfileUseCaseReturn } from './types'
import { OrganizationsProfilesRepository } from '@/core/ports/repositories/prisma/organization-profiles-repository'
import { OrganizationProfileAlreadyExistsError } from '@/core/domain/exceptions/organizations-profiles'

export class CreateOrganizationProfileUseCase {
  constructor(
    protected readonly organizationsProfilesRepository: OrganizationsProfilesRepository
  ) {}

  execute = async (
    payload: Prisma.OrganizationProfileUncheckedCreateInput & {
      design_template: 'primary' | 'secondary' | 'tertiary' | 'quarternary'
    }
  ): Promise<CreateOrganizationProfileUseCaseReturn> => {
    const { id, slug } = payload

    const organizationWithSameSlug =
      await this.organizationsProfilesRepository.getOrganizationProfileBySlug(
        slug
      )

    if (organizationWithSameSlug) {
      throw new OrganizationProfileAlreadyExistsError()
    }

    if (id) {
      const organizationWithSameId =
        await this.organizationsProfilesRepository.getOrganizationProfileById(
          id
        )

      if (organizationWithSameId) {
        throw new OrganizationProfileAlreadyExistsError()
      }
    }

    const organizationProfile =
      await this.organizationsProfilesRepository.createOrganizationProfile(
        payload
      )

    return {
      organizationProfile
    }
  }
}
