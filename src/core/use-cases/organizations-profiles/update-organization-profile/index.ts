import type {
  UpdateOrganizationPayload,
  UpdateOrganizationUseCaseReturn
} from './types'
import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'
import { OrganizationsProfilesRepository } from '@/core/ports/repositories/prisma/organization-profiles-repository'

export class UpdateOrganizationProfileUseCase {
  constructor(
    protected readonly organizationsProfilesRepository: OrganizationsProfilesRepository
  ) {}

  execute = async (
    payload: UpdateOrganizationPayload
  ): Promise<UpdateOrganizationUseCaseReturn> => {
    const { id } = payload

    const organizationExists =
      await this.organizationsProfilesRepository.getOrganizationProfileById(id)

    if (!organizationExists) {
      throw new OrganizationDoesNotExistError()
    }

    const updatedOrganization =
      await this.organizationsProfilesRepository.updateOrganizationProfile(id, payload)

    return {
      organization: updatedOrganization
    }
  }
}
