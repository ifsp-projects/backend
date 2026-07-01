import type { Organization } from '@prisma-generated'

export interface GetAllOrganizationsUseCaseReturn {
  organizations: Organization[]
}
