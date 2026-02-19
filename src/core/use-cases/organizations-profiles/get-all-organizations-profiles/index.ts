import { GetAllOrganizationsUseCaseReturn } from './types'
import { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { OrganizationProfileDoesNotExistError } from '@/core/domain/exceptions/organizations-profiles'

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
