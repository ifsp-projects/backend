import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'
import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { DeleteOrganizationUseCaseReturn } from './types'

export class DeleteOrganizationUseCase {
  constructor(
    protected readonly organizationsRepository: OrganizationsRepository
  ) {}

  execute = async (id: string): Promise<DeleteOrganizationUseCaseReturn> => {
    const organizationExists =
      await this.organizationsRepository.getOrganizationById(id)

    if (!organizationExists) {
      throw new OrganizationDoesNotExistError()
    }

    const deletedOrganization =
      await this.organizationsRepository.deleteOrganization(id)

    if (!deletedOrganization) {
      throw new OrganizationDoesNotExistError()
    }

    return {
      organization: deletedOrganization
    }
  }
}
