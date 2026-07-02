import type { OrganizationProfile, Prisma } from '@prisma-generated'

export interface OrganizationInterface {
  createOrganizationProfile: (
    payload: Prisma.OrganizationUncheckedCreateInput
  ) => Promise<OrganizationProfile>
  deleteOrganizationProfile: (id: string) => Promise<OrganizationProfile | null>
  getAllOrganizationsProfiles: () => Promise<OrganizationProfile[]>
  getOrganizationProfileByEmail: (
    email: string
  ) => Promise<OrganizationProfile | null>
  getOrganizationProfileById: (
    id: string
  ) => Promise<OrganizationProfile | null>
  updateOrganizationProfile: (
    id: string,
    payload: Prisma.OrganizationUncheckedUpdateInput
  ) => Promise<OrganizationProfile | null>
}
