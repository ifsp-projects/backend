import { OrganizationProfile } from '@prisma-generated'

export interface GetAllOrganizationsUseCaseReturn {
  organizationsProfiles: OrganizationProfile[]
}
