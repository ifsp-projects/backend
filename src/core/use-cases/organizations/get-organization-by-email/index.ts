import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'
import { OrganizationsRepository } from '@/core/ports/repositories/prisma/organization-repository'
import { GetOrganizationByEmailUseCaseReturn } from './types'

export class GetOrganizationByEmailUseCase {
  constructor(
    protected readonly organizationsRepository: OrganizationsRepository
  ) {}

  execute = async (
    email: string
  ): Promise<GetOrganizationByEmailUseCaseReturn> => {
    const organization =
      await this.organizationsRepository.getOrganizationByEmail(email)

    if (!organization) {
      throw new OrganizationDoesNotExistError()
    }

    return {
      organization
    }
  }
}
