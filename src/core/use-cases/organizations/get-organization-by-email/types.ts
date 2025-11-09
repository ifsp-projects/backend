import { Organization } from '@prisma/client'

export interface GetOrganizationByEmailUseCaseReturn {
  organization: Organization
}