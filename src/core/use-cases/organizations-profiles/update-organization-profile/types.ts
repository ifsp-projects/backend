import { OrganizationProfile, Prisma } from '@prisma-generated'

export interface UpdateOrganizationPayload
  extends Omit<Prisma.OrganizationProfileUncheckedUpdateInput, 'id'> {
  id: string
}

export interface UpdateOrganizationUseCaseReturn {
  organization: OrganizationProfile
}
