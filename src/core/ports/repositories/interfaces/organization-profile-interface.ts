import { OrganizationProfile, Prisma } from '@prisma/client'

export interface OrganizationInterface {
  createOrganizationProfile: (
    payload: Prisma.OrganizationUncheckedCreateInput
  ) => Promise<OrganizationProfile>
  getAllOrganizationsProfiles: () => Promise<OrganizationProfile[]>
  getOrganizationProfileById: (
    id: string
  ) => Promise<OrganizationProfile | null>
  getOrganizationProfileByEmail: (
    email: string
  ) => Promise<OrganizationProfile | null>
  updateOrganizationProfile: (
    id: string,
    payload: Prisma.OrganizationUncheckedUpdateInput
  ) => Promise<OrganizationProfile | null>
  deleteOrganizationProfile: (id: string) => Promise<OrganizationProfile | null>
}
