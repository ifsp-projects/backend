import { Organization } from '@prisma/client'

export interface GetOrganizationBySlugUseCaseReturn {
  organization: Organization
}
