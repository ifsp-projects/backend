import { OrganizationProfile } from '@prisma/client'

export interface GetAllOrganizationsUseCaseReturn {
  organizationsProfiles: OrganizationProfile[]
}
