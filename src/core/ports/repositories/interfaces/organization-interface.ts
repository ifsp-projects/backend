import { Organization, Prisma } from '@prisma/client'

export type OrganizationWithProfileInclude = Prisma.OrganizationGetPayload<{
  include: {
    organization_profile: true
  }
}>

export interface OrganizationInterface {
  createOrganization: (
    payload: Prisma.OrganizationUncheckedCreateInput
  ) => Promise<Organization>
  getAllOrganizations: () => Promise<Organization[]>
  getOrganizationById: (
    id: string
  ) => Promise<OrganizationWithProfileInclude | null>
  getOrganizationByEmail: (
    email: string
  ) => Promise<OrganizationWithProfileInclude | null>
  getOrganizationBySlug: (
    slug: string
  ) => Promise<OrganizationWithProfileInclude | null>
  updateOrganization: (
    id: string,
    payload: Prisma.OrganizationUncheckedUpdateInput
  ) => Promise<OrganizationWithProfileInclude | null>
  deleteOrganization: (id: string) => Promise<Organization | null>
}
