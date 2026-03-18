import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'
import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { OngCategory } from '@prisma-generated'
import { GetAllOrganizationsUseCaseReturn } from './types'

export class GetAllOrganizationsUseCase {
  constructor(
    protected readonly organizationsRepository: OrganizationsRepository
  ) { }

  execute = async (filters?: { name?: string; ong_type?: OngCategory }): Promise<GetAllOrganizationsUseCaseReturn> => {
    const data = await this.organizationsRepository.getAllOrganizations(filters)

    if (!data) {
      throw new OrganizationDoesNotExistError()
    }

    return {
      organizations: data
    }
  }
}
