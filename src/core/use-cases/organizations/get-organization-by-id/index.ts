import type { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'

import type { GetOrganizationByIdUseCaseReturn } from './types'

export class GetOrganizationByIdUseCase {
  constructor(
    protected readonly organizationsRepository: OrganizationsRepository
  ) {}

  execute = async (id: string): Promise<GetOrganizationByIdUseCaseReturn> => {
    const organization =
      await this.organizationsRepository.getOrganizationById(id)

    if (!organization) {
      throw new OrganizationDoesNotExistError()
    }

    return {
      organization
    }
  }
}
