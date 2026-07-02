import type { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'
import type { OngCategoryEnum } from '@prisma-generated'

import type { GetAllOrganizationsUseCaseReturn } from './types'

export class GetAllOrganizationsUseCase {
  constructor(
    protected readonly organizationsRepository: OrganizationsRepository
  ) {}

  execute = async (filters?: {
    name?: string
    ong_type?: OngCategoryEnum
  }): Promise<GetAllOrganizationsUseCaseReturn> => {
    const data = await this.organizationsRepository.getAllOrganizations(filters)

    if (!data) {
      throw new OrganizationDoesNotExistError()
    }

    return {
      organizations: data
    }
  }
}
