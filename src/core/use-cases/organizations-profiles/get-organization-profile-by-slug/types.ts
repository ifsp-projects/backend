import { OrganizationProfile } from '@prisma/client'

export interface GetOrganizationProfileByEmailUseCaseReturn {
  organizationProfile: OrganizationProfile
}