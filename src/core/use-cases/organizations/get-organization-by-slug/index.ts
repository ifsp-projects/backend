import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'
import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { GetOrganizationBySlugUseCaseReturn } from './types'

export class GetOrganizationBySlugUseCase {
  constructor(
    protected readonly organizationsRepository: OrganizationsRepository
  ) {}

  execute = async (
    slug: string
  ): Promise<GetOrganizationBySlugUseCaseReturn> => {
    const organization =
      await this.organizationsRepository.getOrganizationBySlug(slug)

    if (!organization) {
      throw new OrganizationDoesNotExistError()
    }

    return {
      organization
    }
  }
}
