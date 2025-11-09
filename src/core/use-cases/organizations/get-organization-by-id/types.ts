import { Organization } from '@prisma/client'

export interface GetOrganizationByIdUseCaseReturn {
  organization: Organization
}