import type { OngCategoryEnum, Organization, Prisma } from '@prisma-generated'

export type OrganizationWithProfileInclude = Prisma.OrganizationGetPayload<{
  include: {
    organization_profile: true
  }
}>

export interface OrganizationInterface {
  createOrganization: (
    payload: Prisma.OrganizationUncheckedCreateInput
  ) => Promise<Organization>
  deleteOrganization: (id: string) => Promise<Organization | null>
  getAllOrganizations: (filters?: {
    name?: string
    ong_type?: OngCategoryEnum
  }) => Promise<Organization[]>
  getOrganizationByEmail: (
    email: string
  ) => Promise<OrganizationWithProfileInclude | null>
  getOrganizationById: (
    id: string
  ) => Promise<OrganizationWithProfileInclude | null>
  getOrganizationBySlug: (
    slug: string
  ) => Promise<OrganizationWithProfileInclude | null>
  updateOrganization: (
    id: string,
    payload: Prisma.OrganizationUncheckedUpdateInput
  ) => Promise<OrganizationWithProfileInclude | null>
}
