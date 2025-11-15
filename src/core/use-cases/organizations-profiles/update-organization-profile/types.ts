import { Organization, Prisma } from '@prisma/client'

export interface UpdateOrganizationPayload
  extends Omit<Prisma.OrganizationUncheckedUpdateInput, 'id'> {
  id: string
}

export interface UpdateOrganizationUseCaseReturn {
  organization: Organization
}