import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import {
  UpdateOrganizationPayload,
  UpdateOrganizationUseCaseReturn
} from './types'
import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'

export class UpdateOrganizationUseCase {
  constructor(
    protected readonly organizationsRepository: OrganizationsRepository
  ) {}

  execute = async (
    payload: UpdateOrganizationPayload
  ): Promise<UpdateOrganizationUseCaseReturn> => {
    const { id } = payload

    const organizationExists =
      await this.organizationsRepository.getOrganizationById(id)

    if (!organizationExists) {
      throw new OrganizationDoesNotExistError()
    }

    const updatedOrganization =
      await this.organizationsRepository.updateOrganization(id, payload)

    return {
      organization: updatedOrganization
    }
  }
}
