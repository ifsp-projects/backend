import { Organization } from '@prisma/client'

export interface GetAllOrganizationsUseCaseReturn {
  organizations: Organization[]
}
