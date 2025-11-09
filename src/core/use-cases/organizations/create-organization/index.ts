import { OrganizationsRepository } from "@/core/ports/repositories/prisma/organization-repository"
import { Prisma } from "@prisma/client"
import { CreateOrganizationUseCaseReturn } from "./types"
import { OrganizationAlreadyExistsError } from "@/core/domain/exceptions/organizations"

export class CreateOrganizationUseCase {
  constructor(
    protected readonly organizationsRepository: OrganizationsRepository
  ) {}

  execute = async (
    payload: Prisma.OrganizationUncheckedCreateInput
  ): Promise<CreateOrganizationUseCaseReturn> => {
    const { id, email } = payload

    const organizationWithSameEmail =
      await this.organizationsRepository.getOrganizationByEmail(email)

    if (organizationWithSameEmail) {
      throw new OrganizationAlreadyExistsError()
    }

    if (id) {
      const organizationWithSameId =
        await this.organizationsRepository.getOrganizationById(id)

      if (organizationWithSameId) {
        throw new OrganizationAlreadyExistsError()
      }
    }

    const organization =
      await this.organizationsRepository.createOrganization(payload)

    return {
      organization
    }
  }
}
