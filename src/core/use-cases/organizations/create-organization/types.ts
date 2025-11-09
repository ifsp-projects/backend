import { Organization } from '@prisma/client'

export interface CreateOrganizationUseCaseReturn {
  organization: Organization
}