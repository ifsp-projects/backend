import type {
  UpdateOrganizationPayload,
  UpdateOrganizationUseCaseReturn
} from './types'
import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'
import { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { PagesRepository } from '@/adapters/outbound/prisma/repositories/pages-repository'

export class UpdateOrganizationProfileUseCase {
  constructor(
    protected readonly organizationsProfilesRepository: OrganizationsProfilesRepository,

    protected readonly pagesRepository: PagesRepository
  ) {}

  execute = async (
    payload: UpdateOrganizationPayload
  ): Promise<UpdateOrganizationUseCaseReturn> => {
    const { id } = payload

    console.log(`slug: ${payload.slug}`)

    const organizationExists =
      await this.organizationsProfilesRepository.getOrganizationProfileById(id)

    if (!organizationExists) {
      throw new OrganizationDoesNotExistError()
    }

    let updatedOrganization

    if (payload.design_template) {
      const page = await this.pagesRepository.getPageBySlug(payload.slug as string)

      console.log(page)

      updatedOrganization = await this.organizationsProfilesRepository.updateOrganizationProfile(
        id,
        payload,
        page?.id
      )

      return {
        organization: updatedOrganization
      }
    }

    updatedOrganization = await this.organizationsProfilesRepository.updateOrganizationProfile(
        id,
        payload
      )

    return {
      organization: updatedOrganization
    }
  }
}
